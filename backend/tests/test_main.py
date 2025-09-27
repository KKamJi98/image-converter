"""메인 API 테스트"""

import io

from fastapi.testclient import TestClient
from PIL import Image

from app.api.images import METADATA_HEADERS
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    """루트 엔드포인트 테스트"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Image Converter API is running"}


def test_health_check():
    """헬스 체크 엔드포인트 테스트"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_get_supported_formats():
    """지원 형식 조회 테스트"""
    response = client.get("/api/v1/formats")
    assert response.status_code == 200
    data = response.json()
    assert "supported_formats" in data
    assert "input_formats" in data
    assert "webp" in data["supported_formats"]
    assert "jpeg" in data["supported_formats"]


def test_convert_endpoint_returns_metadata_headers():
    """이미지 변환 API가 메타데이터 헤더를 포함하는지 검증"""
    image = Image.new("RGB", (12, 34), color="blue")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)

    files = {"file": ("sample.png", buffer.getvalue(), "image/png")}
    data = {"target_format": "jpeg"}

    response = client.post("/api/v1/convert", files=files, data=data)

    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"

    for header in METADATA_HEADERS:
        assert header in response.headers

    assert response.headers["X-Original-Width"] == "12"
    assert response.headers["X-Original-Height"] == "34"
    assert response.headers["X-Converted-Width"] == "12"
    assert response.headers["X-Converted-Height"] == "34"
    assert response.headers["X-Target-Format"] == "jpeg"
