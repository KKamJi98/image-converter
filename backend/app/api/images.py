"""
이미지 변환 API 엔드포인트
WebP, JPEG, PNG 형식 간 변환 및 크기/품질 조정 지원
"""

import io
import logging
import time
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

from app.models.image_models import ConversionRequest
from app.services.image_converter import ImageConverter

logger = logging.getLogger(__name__)

router = APIRouter()
converter = ImageConverter()


METADATA_HEADERS = {
    "X-Original-Size",
    "X-Converted-Size",
    "X-Compression-Ratio",
    "X-Original-Width",
    "X-Original-Height",
    "X-Converted-Width",
    "X-Converted-Height",
    "X-Process-Time",
    "X-Target-Format",
}


@router.post("/convert")
async def convert_image(
    file: UploadFile = File(...),
    target_format: str = Form(...),
    max_width: Optional[int] = Form(None),
    max_height: Optional[int] = Form(None),
    max_size_mb: Optional[float] = Form(None),
    quality: Optional[int] = Form(100),
):
    """
    이미지 변환 API

    Args:
        file: 업로드할 이미지 파일
        target_format: 변환할 형식 (webp, jpeg, png, jpg)
        max_width: 최대 너비 (비율 유지)
        max_height: 최대 높이 (비율 유지)
        max_size_mb: 최대 파일 크기 (MB)
        quality: 이미지 품질 (1-100, JPEG/WebP만 적용)
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        logger.warning("Invalid file upload attempted: %s", file.filename)
        raise HTTPException(status_code=400, detail="Invalid image file")

    try:
        # 이미지 파일 읽기
        image_data = await file.read()
        logger.info(
            "Converting %s (%d bytes) to %s",
            file.filename,
            len(image_data),
            target_format,
        )

        # 변환 요청 객체 생성
        request = ConversionRequest(
            target_format=target_format.lower(),
            max_width=max_width,
            max_height=max_height,
            max_size_mb=max_size_mb,
            quality=quality,
        )
        logger.debug("Conversion request params: %s", request.model_dump())

        # 이미지 변환 수행
        start_time = time.perf_counter()
        converted_data, metadata = await converter.convert_image(image_data, request)
        duration = time.perf_counter() - start_time
        logger.info(
            "Conversion complete: %s -> %s (%d -> %d bytes) in %.2fs (dims %dx%d -> %dx%d)",
            metadata.original_format,
            metadata.converted_format,
            metadata.original_size,
            metadata.converted_size,
            duration,
            metadata.original_dimensions[0],
            metadata.original_dimensions[1],
            metadata.converted_dimensions[0],
            metadata.converted_dimensions[1],
        )

        # 변환된 이미지를 스트림으로 반환
        width_before, height_before = metadata.original_dimensions
        width_after, height_after = metadata.converted_dimensions

        response_headers = {
            "Content-Disposition": f"attachment; filename=converted.{target_format}",
            "X-Original-Size": str(metadata.original_size),
            "X-Converted-Size": str(metadata.converted_size),
            "X-Compression-Ratio": f"{metadata.compression_ratio:.6f}",
            "X-Original-Width": str(width_before),
            "X-Original-Height": str(height_before),
            "X-Converted-Width": str(width_after),
            "X-Converted-Height": str(height_after),
            "X-Process-Time": f"{duration:.3f}",
            "X-Target-Format": metadata.converted_format,
        }

        return StreamingResponse(
            io.BytesIO(converted_data),
            media_type=f"image/{target_format}",
            headers=response_headers,
        )

    except Exception as e:
        logger.exception("Image conversion failed")
        raise HTTPException(
            status_code=500, detail=f"Image conversion failed: {str(e)}"
        )


@router.get("/formats")
async def get_supported_formats():
    """지원하는 이미지 형식 목록 반환"""
    logger.info("Supported formats requested")
    return {
        "supported_formats": ["webp", "jpeg", "jpg", "png"],
        "input_formats": ["webp", "jpeg", "jpg", "png", "bmp", "tiff"],
    }
