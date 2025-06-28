"""
Image Converter Backend API
FastAPI 기반 이미지 변환 서비스

# CI 트리거 테스트를 위한 주석 추가
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.api import images

app = FastAPI(
    title="Image Converter API",
    description="이미지 형식 변환, 크기 조정, 품질 최적화 API",
    version="0.1.0",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS 설정 - 개발 환경용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(images.router, prefix="/api/v1", tags=["images"])


@app.get("/")
async def root():
    """Health check endpoint"""
    logger.info("Root endpoint called")
    return {"message": "Image Converter API is running"}


@app.get("/health")
async def health_check():
    """Health check for Kubernetes probes"""
    logger.info("Health check requested")
    return {"status": "healthy"}
