"""
이미지 변환 관련 Pydantic 모델
"""

from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ConversionRequest(BaseModel):
    """이미지 변환 요청 모델"""

    target_format: str = Field(..., description="변환할 이미지 형식")
    max_width: Optional[int] = Field(None, gt=0, description="최대 너비")
    max_height: Optional[int] = Field(None, gt=0, description="최대 높이")
    max_size_mb: Optional[float] = Field(None, gt=0, description="최대 파일 크기 (MB)")
    quality: Optional[int] = Field(100, ge=1, le=100, description="이미지 품질")

    @field_validator("target_format")
    @classmethod
    def validate_format(cls, v):
        allowed_formats = ["webp", "jpeg", "jpg", "png"]
        if v.lower() not in allowed_formats:
            raise ValueError(f"Unsupported format. Allowed: {allowed_formats}")
        return v.lower()


class ConversionResponse(BaseModel):
    """이미지 변환 응답 모델"""

    success: bool = Field(..., description="변환 성공 여부")
    message: str = Field(..., description="응답 메시지")
    metadata: Optional["ImageMetadata"] = Field(None, description="이미지 메타데이터")


class ImageMetadata(BaseModel):
    """이미지 메타데이터"""

    original_format: str = Field(..., description="원본 이미지 형식")
    converted_format: str = Field(..., description="변환된 이미지 형식")
    original_size: int = Field(..., description="원본 파일 크기 (bytes)")
    converted_size: int = Field(..., description="변환된 파일 크기 (bytes)")
    original_dimensions: tuple[int, int] = Field(
        ..., description="원본 이미지 크기 (width, height)"
    )
    converted_dimensions: tuple[int, int] = Field(
        ..., description="변환된 이미지 크기 (width, height)"
    )
    compression_ratio: float = Field(..., description="압축률")


# Forward reference 해결
ConversionResponse.model_rebuild()
