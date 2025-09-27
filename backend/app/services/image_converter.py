"""
이미지 변환 서비스
PIL을 사용한 이미지 형식 변환, 크기 조정, 품질 최적화

TL;DR: Provides high-quality resizing and format conversion with
resource-aware concurrency limits and large-image safeguards.
"""

import asyncio
import io
import logging
import os
import tempfile
from typing import Tuple

from PIL import Image, ImageFile, ImageOps

try:
    import pyvips  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    pyvips = None


_vips_cache_configured = False


def _configure_vips_cache() -> None:
    """Set libvips cache limits to prevent resident memory growth."""
    global _vips_cache_configured
    if _vips_cache_configured or pyvips is None:  # type: ignore[name-defined]
        return

    def _safe_int(env_name: str, default: int) -> int:
        raw = os.getenv(env_name)
        if raw is None:
            return default
        try:
            return int(raw)
        except ValueError:
            logger.warning(
                "Invalid value for %s=%s; using default %d", env_name, raw, default
            )
            return default

    try:
        max_mem_mb = _safe_int("VIPS_CACHE_MAX_MEM_MB", 128)
        if max_mem_mb > 0:
            pyvips.cache_set_max_mem(max_mem_mb * 1024 * 1024)  # type: ignore[attr-defined]

        max_ops = _safe_int("VIPS_CACHE_MAX_OPS", 200)
        if max_ops > 0:
            pyvips.cache_set_max(max_ops)  # type: ignore[attr-defined]

        max_files = _safe_int("VIPS_CACHE_MAX_FILES", 50)
        if max_files > 0:
            pyvips.cache_set_max_files(max_files)  # type: ignore[attr-defined]
    except Exception:
        logger.exception("Failed to configure pyvips cache constraints")
    finally:
        _vips_cache_configured = True


from app.models.image_models import ConversionRequest, ImageMetadata

logger = logging.getLogger(__name__)

# 대형 이미지 안전장치: 기본은 무제한(요청 시 설정)
_max_pixels_env = os.getenv("MAX_IMAGE_PIXELS", "0").strip()
try:
    _max_pixels_val = int(_max_pixels_env)
except ValueError:
    _max_pixels_val = 0

Image.MAX_IMAGE_PIXELS = None if _max_pixels_val <= 0 else _max_pixels_val
ImageFile.LOAD_TRUNCATED_IMAGES = True


class ImageConverter:
    """이미지 변환 처리 클래스"""

    def __init__(self):
        self.supported_formats = {"webp", "jpeg", "jpg", "png"}
        # 동시 변환 제한: CPU 스파이크/메모리 폭주 방지
        max_conc = int(os.getenv("CONVERTER_MAX_CONCURRENCY", "2"))
        self._semaphore = asyncio.Semaphore(max_conc)
        # VIPS 사용 여부: 기본 활성(사용자가 0/false로 끌 수 있음)
        _vips_env = os.getenv("USE_VIPS", "1").strip().lower()
        _vips_enabled = _vips_env not in {"0", "false", "no"}
        self._use_vips = bool(_vips_enabled and pyvips is not None)
        if self._use_vips:
            _configure_vips_cache()
        drop_env = os.getenv("VIPS_CACHE_DROP_AFTER_JOB", "1").strip().lower()
        self._drop_vips_cache = drop_env in {"1", "true", "yes"}

    async def convert_image(
        self, image_data: bytes, request: ConversionRequest
    ) -> Tuple[bytes, ImageMetadata]:
        """이미지 변환 수행"""
        logger.debug(
            "Starting conversion: target=%s, options=%s",
            request.target_format,
            request.model_dump(),
        )

        async with self._semaphore:
            return await asyncio.to_thread(
                self._convert_image_sync, image_data, request
            )

    def _convert_image_sync(
        self, image_data: bytes, request: ConversionRequest
    ) -> Tuple[bytes, ImageMetadata]:
        """블로킹 이미지 변환 로직"""
        if self._use_vips:
            try:
                return self._convert_image_vips(image_data, request)
            except Exception:
                logger.exception("VIPS path failed, falling back to Pillow")
                # Pillow 경로로 폴백

        # 대용량 입력은 메모리 대신 디스크로 스풀링하여 피크 메모리 사용량을 낮춤
        spool_threshold_mb = float(os.getenv("SPOOL_THRESHOLD_MB", "4"))
        spool_threshold_bytes = int(spool_threshold_mb * 1024 * 1024)

        spooled_in = tempfile.SpooledTemporaryFile(max_size=spool_threshold_bytes)
        spooled_in.write(image_data)
        spooled_in.seek(0)

        original_image = Image.open(spooled_in)
        original_format = (
            original_image.format.lower() if original_image.format else "unknown"
        )
        original_size = len(image_data)
        original_dimensions = original_image.size

        original_image = ImageOps.exif_transpose(original_image)

        processed_image = self._resize_image(original_image, request)
        converted_data = self._convert_format(processed_image, request)

        if request.max_size_mb:
            converted_data = self._optimize_file_size(
                processed_image, request, request.max_size_mb
            )

        metadata = ImageMetadata(
            original_format=original_format,
            converted_format=request.target_format,
            original_size=original_size,
            converted_size=len(converted_data),
            original_dimensions=original_dimensions,
            converted_dimensions=processed_image.size,
            compression_ratio=len(converted_data) / original_size,
        )

        return converted_data, metadata

    # ------------------------
    # VIPS 경로 (옵션)
    # ------------------------
    def _convert_image_vips(
        self, image_data: bytes, request: ConversionRequest
    ) -> Tuple[bytes, ImageMetadata]:
        """pyvips 기반 변환 (저메모리 스트리밍 파이프라인)"""
        # 로더 정보 파악
        img = pyvips.Image.new_from_buffer(image_data, "")  # type: ignore[attr-defined]
        original_dimensions = (int(img.width), int(img.height))

        # vips-loader 이름에서 포맷 추론 (예: jpegload_buffer)
        try:
            loader = img.get("vips-loader")  # type: ignore[attr-defined]
            if isinstance(loader, bytes):
                loader = loader.decode()
            if isinstance(loader, str) and "jpeg" in loader:
                original_format = "jpeg"
            elif isinstance(loader, str) and "webp" in loader:
                original_format = "webp"
            elif isinstance(loader, str) and "png" in loader:
                original_format = "png"
            else:
                original_format = "unknown"
        except Exception:
            original_format = "unknown"

        # 리사이즈 (비율 유지)
        resized = self._resize_vips(img, request)

        # 파일 크기 제한이 있는 경우 품질 이진 탐색에서 인코딩을 수행
        if request.max_size_mb:
            converted_data = self._optimize_file_size_vips(
                resized, request, request.max_size_mb
            )
        else:
            converted_data = self._encode_vips(resized, request)

        converted_dimensions = (int(resized.width), int(resized.height))

        metadata = ImageMetadata(
            original_format=original_format,
            converted_format=request.target_format,
            original_size=len(image_data),
            converted_size=len(converted_data),
            original_dimensions=original_dimensions,
            converted_dimensions=converted_dimensions,
            compression_ratio=(len(converted_data) / max(1, len(image_data))),
        )
        if self._drop_vips_cache:
            try:
                pyvips.cache_drop_all()  # type: ignore[attr-defined]
            except Exception:
                logger.exception("Failed to drop pyvips cache after job")
        return converted_data, metadata

    def _resize_vips(
        self, img: "pyvips.Image", request: ConversionRequest
    ) -> "pyvips.Image":
        if not request.max_width and not request.max_height:
            return img

        original_width, original_height = int(img.width), int(img.height)
        if request.max_width and request.max_height:
            ratio = min(
                request.max_width / original_width,
                request.max_height / original_height,
            )
        elif request.max_width:
            ratio = request.max_width / original_width
        else:
            ratio = request.max_height / original_height

        if ratio >= 1:
            return img

        # 커널 선택
        if ratio < 0.25:
            kernel = "nearest"  # 저비용
        elif ratio < 0.5:
            kernel = "linear"
        else:
            kernel = "lanczos3"

        # vips resize는 scale 기반
        resized = img.resize(ratio, kernel=kernel)
        # JPEG로 저장할 때 알파 채널이 있으면 flatten
        if request.target_format in {"jpeg", "jpg"}:
            try:
                if resized.hasalpha():  # type: ignore[attr-defined]
                    resized = resized.flatten(background=[255, 255, 255])
            except Exception:
                pass
        return resized

    def _encode_vips(self, img: "pyvips.Image", request: ConversionRequest) -> bytes:
        fmt = request.target_format
        quality = int(request.quality or 100)
        lossless_requested = (request.quality or 100) >= 100

        if fmt in {"jpeg", "jpg"}:
            return img.write_to_buffer(
                ".jpg",
                Q=quality,
                interlace=True,  # progressive
            )
        elif fmt == "webp":
            params = {
                "Q": quality,
            }
            if lossless_requested:
                params.update(
                    {
                        "lossless": True,
                        "Q": 100,
                    }
                )
            return img.write_to_buffer(
                ".webp",
                **params,
            )
        elif fmt == "png":
            return img.write_to_buffer(
                ".png",
                compression=6,
            )
        else:
            # 지원 외 형식은 Pillow 경로로 폴백
            pil_img = self._vips_to_pil(img)
            return self._convert_format(pil_img, request)

    def _optimize_file_size_vips(
        self, img: "pyvips.Image", request: ConversionRequest, max_size_mb: float
    ) -> bytes:
        max_size_bytes = int(max_size_mb * 1024 * 1024)
        low, high = 1, max(1, (request.quality or 100))
        best = None
        best_q = low
        for _ in range(8):
            mid = (low + high) // 2
            tmp_req = ConversionRequest(
                target_format=request.target_format, quality=mid
            )
            buf = self._encode_vips(img, tmp_req)
            if len(buf) <= max_size_bytes:
                best = buf
                best_q = mid
                low = mid + 1
            else:
                high = mid - 1
            if low > high:
                break
        if best is not None:
            logger.debug("[VIPS] Selected quality %d within size", best_q)
            return best
        # 실패 시 최소 품질로 저장
        return self._encode_vips(
            img, ConversionRequest(target_format=request.target_format, quality=10)
        )

    def _vips_to_pil(self, img: "pyvips.Image") -> Image.Image:
        # vips 이미지를 메모리 버퍼로 변환한 뒤 Pillow로 로드
        fmt = ".png"
        buf = img.write_to_buffer(fmt)
        return Image.open(io.BytesIO(buf))

    def _resize_image(
        self, image: Image.Image, request: ConversionRequest
    ) -> Image.Image:
        """이미지 크기 조정 (비율 유지)"""
        if not request.max_width and not request.max_height:
            return image

        original_width, original_height = image.size

        # 최대 크기 계산
        if request.max_width and request.max_height:
            # 둘 다 지정된 경우, 비율을 유지하면서 둘 다 초과하지 않도록
            ratio = min(
                request.max_width / original_width,
                request.max_height / original_height,
            )
        elif request.max_width:
            ratio = request.max_width / original_width
        else:  # max_height만 지정
            ratio = request.max_height / original_height

        # 크기가 이미 작으면 그대로 반환
        if ratio >= 1:
            return image

        new_width = max(1, int(original_width * ratio))
        new_height = max(1, int(original_height * ratio))

        logger.debug(
            "Resizing image from %s to %s",
            (original_width, original_height),
            (new_width, new_height),
        )

        # JPEG의 경우 디코더 단계에서 다운스케일 힌트 제공(메모리 사용량 절감)
        try:
            if getattr(image, "format", "").upper() == "JPEG" and ratio < 1:
                image.draft("RGB", (new_width, new_height))
        except Exception:  # draft 미지원 포맷 등은 무시
            pass

        # 큰 비율 축소 시 비용-효율적인 필터 선택
        # (예: 0.25 미만: BOX, 0.5 미만: BILINEAR, 그 외: LANCZOS)
        if ratio < 0.25:
            resample = Image.Resampling.BOX
        elif ratio < 0.5:
            resample = Image.Resampling.BILINEAR
        else:
            resample = Image.Resampling.LANCZOS

        # 메모리 효율적 downscale 경로: thumbnail + reducing_gap
        resized = image.copy()
        resized.thumbnail((new_width, new_height), resample=resample, reducing_gap=3.0)
        # 정확한 타깃 크기 보장(오차 최소화)
        if resized.size != (new_width, new_height):
            resized = resized.resize((new_width, new_height), resample=resample)
        return resized

    def _convert_format(self, image: Image.Image, request: ConversionRequest) -> bytes:
        """이미지 형식 변환"""
        # 출력도 스풀 파일로 처리하여 메모리 피크를 낮춤
        spool_threshold_mb = float(os.getenv("SPOOL_THRESHOLD_MB", "4"))
        spool_threshold_bytes = int(spool_threshold_mb * 1024 * 1024)
        output = tempfile.SpooledTemporaryFile(max_size=spool_threshold_bytes)

        # PNG 투명도 처리
        if request.target_format in ["jpeg", "jpg"] and image.mode in ["RGBA", "LA"]:
            # JPEG는 투명도를 지원하지 않으므로 흰색 배경으로 합성
            background = Image.new("RGB", image.size, (255, 255, 255))
            background.paste(
                image, mask=image.split()[-1] if image.mode == "RGBA" else None
            )
            image = background

        # 형식별 저장 옵션
        format_name = (
            "JPEG"
            if request.target_format in ["jpg", "jpeg"]
            else request.target_format.upper()
        )
        save_kwargs = {"format": format_name}

        lossless_requested = (request.quality or 100) >= 100

        if request.target_format in ["jpeg", "jpg"]:
            save_kwargs.update(
                {
                    "quality": request.quality,
                    "optimize": True,
                    "subsampling": 0,
                    "progressive": True,
                }
            )
        elif request.target_format == "webp":
            webp_kwargs = {
                "quality": request.quality,
                "optimize": True,
                "method": 4,
            }
            if lossless_requested:
                webp_kwargs.update(
                    {
                        "lossless": True,
                        "quality": 100,
                    }
                )
            save_kwargs.update(webp_kwargs)
        elif request.target_format == "png":
            save_kwargs.update(
                {
                    "optimize": True,
                    "compress_level": 6,
                }
            )

        logger.debug("Saving image with params: %s", save_kwargs)
        image.save(output, **save_kwargs)
        output.seek(0)
        data = output.read()
        output.close()
        return data

    def _optimize_file_size(
        self, image: Image.Image, request: ConversionRequest, max_size_mb: float
    ) -> bytes:
        """파일 크기 제한에 맞춰 품질 조정 (이진 탐색)"""
        max_size_bytes = int(max_size_mb * 1024 * 1024)
        logger.debug("Optimizing file size to <= %d bytes", max_size_bytes)

        low, high = 1, max(1, (request.quality or 100))
        best_data = None
        best_quality = low

        # 최대 약 7~8회의 인코딩 시도로 수렴
        for _ in range(8):
            mid = (low + high) // 2
            temp_request = ConversionRequest(
                target_format=request.target_format,
                quality=mid,
            )
            logger.debug("Trying quality %d", mid)
            converted_data = self._convert_format(image, temp_request)

            if len(converted_data) <= max_size_bytes:
                best_data = converted_data
                best_quality = mid
                low = mid + 1
            else:
                high = mid - 1

            if low > high:
                break

        if best_data is not None:
            logger.debug("Selected quality %d within size", best_quality)
            return best_data

        # 실패 시 최소 품질로 재시도
        logger.debug("Fallback to minimum quality 10")
        return self._convert_format(
            image,
            ConversionRequest(target_format=request.target_format, quality=10),
        )
