"""
메인 API 테스트
"""

import pytest
from fastapi.testclient import TestClient

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
