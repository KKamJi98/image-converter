"""
이미지 변환 서비스
PIL을 사용한 이미지 형식 변환, 크기 조정, 품질 최적화

TL;DR: Provides high-quality resizing and format conversion.
"""

import asyncio
import io
import logging
from typing import Tuple

from PIL import Image, ImageOps

from app.models.image_models import ConversionRequest, ImageMetadata

logger = logging.getLogger(__name__)


class ImageConverter:
    """이미지 변환 처리 클래스"""

    def __init__(self):
        self.supported_formats = {"webp", "jpeg", "jpg", "png"}

    async def convert_image(
        self, image_data: bytes, request: ConversionRequest
    ) -> Tuple[bytes, ImageMetadata]:
        """이미지 변환 수행"""
        logger.debug(
            "Starting conversion: target=%s, options=%s",
            request.target_format,
            request.model_dump(),
        )

        return await asyncio.to_thread(self._convert_image_sync, image_data, request)

    def _convert_image_sync(
        self, image_data: bytes, request: ConversionRequest
    ) -> Tuple[bytes, ImageMetadata]:
        """블로킹 이미지 변환 로직"""
        original_image = Image.open(io.BytesIO(image_data))
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

        new_width = int(original_width * ratio)
        new_height = int(original_height * ratio)

        logger.debug(
            "Resizing image from %s to %s",
            (original_width, original_height),
            (new_width, new_height),
        )
        # ImageOps.contain provides higher quality for large reductions
        return ImageOps.contain(
            image, (new_width, new_height), method=Image.Resampling.LANCZOS
        )

    def _convert_format(self, image: Image.Image, request: ConversionRequest) -> bytes:
        """이미지 형식 변환"""
        output = io.BytesIO()

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

        if request.target_format in ["jpeg", "jpg"]:
            save_kwargs.update(
                {
                    "quality": request.quality,
                    "optimize": True,
                    "subsampling": 0,
                }
            )
        elif request.target_format == "webp":
            save_kwargs.update(
                {
                    "quality": request.quality,
                    "optimize": True,
                }
            )
        elif request.target_format == "png":
            save_kwargs.update(
                {
                    "optimize": True,
                }
            )

        logger.debug("Saving image with params: %s", save_kwargs)
        image.save(output, **save_kwargs)
        return output.getvalue()

    def _optimize_file_size(
        self, image: Image.Image, request: ConversionRequest, max_size_mb: float
    ) -> bytes:
        """파일 크기 제한에 맞춰 품질 조정"""
        max_size_bytes = int(max_size_mb * 1024 * 1024)

        # 초기 품질로 변환
        current_quality = request.quality or 100
        logger.debug("Optimizing file size to <= %d bytes", max_size_bytes)

        for _ in range(10):  # 최대 10번 시도
            temp_request = ConversionRequest(
                target_format=request.target_format,
                quality=current_quality,
            )
            logger.debug("Trying quality %d", current_quality)
            converted_data = self._convert_format(image, temp_request)

            if len(converted_data) <= max_size_bytes:
                logger.debug("File size %d bytes within limit", len(converted_data))
                return converted_data

            # 품질을 10씩 감소
            current_quality -= 10
            if current_quality < 10:
                break

        # 최종적으로 최소 품질로 변환
        final_request = ConversionRequest(
            target_format=request.target_format,
            quality=10,
        )
        logger.debug("Fallback to minimum quality 10")
        return self._convert_format(image, final_request)
