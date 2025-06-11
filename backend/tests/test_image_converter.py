"""
이미지 변환 서비스 테스트
"""

import io

import pytest
from PIL import Image

from app.models.image_models import ConversionRequest
from app.services.image_converter import ImageConverter


@pytest.fixture
def sample_image_data():
    """테스트용 샘플 이미지 생성"""
    image = Image.new("RGB", (100, 100), color="red")
    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()


@pytest.fixture
def converter():
    """이미지 변환기 인스턴스"""
    return ImageConverter()


@pytest.mark.asyncio
async def test_basic_conversion(converter, sample_image_data):
    """기본 이미지 변환 테스트"""
    request = ConversionRequest(target_format="webp")

    converted_data, metadata = await converter.convert_image(sample_image_data, request)

    assert len(converted_data) > 0
    assert metadata.converted_format == "webp"
    assert metadata.original_dimensions == (100, 100)
    assert metadata.converted_dimensions == (100, 100)


@pytest.mark.asyncio
async def test_resize_conversion(converter, sample_image_data):
    """크기 조정 변환 테스트"""
    request = ConversionRequest(
        target_format="jpeg",
        max_width=50,
        max_height=50,
    )

    converted_data, metadata = await converter.convert_image(sample_image_data, request)

    assert metadata.converted_dimensions == (50, 50)
    assert metadata.converted_format == "jpeg"


@pytest.mark.asyncio
async def test_quality_conversion(converter, sample_image_data):
    """품질 조정 변환 테스트"""
    request_high = ConversionRequest(target_format="jpeg", quality=95)
    request_low = ConversionRequest(target_format="jpeg", quality=20)

    high_data, high_meta = await converter.convert_image(
        sample_image_data, request_high
    )
    low_data, low_meta = await converter.convert_image(sample_image_data, request_low)

    # 낮은 품질이 더 작은 파일 크기를 가져야 함
    assert low_meta.converted_size < high_meta.converted_size
