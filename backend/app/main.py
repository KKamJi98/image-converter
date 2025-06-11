"""
Image Converter Backend API
FastAPI 기반 이미지 변환 서비스
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import images

app = FastAPI(
    title="Image Converter API",
    description="이미지 형식 변환, 크기 조정, 품질 최적화 API",
    version="0.1.0",
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
    return {"message": "Image Converter API is running"}


@app.get("/health")
async def health_check():
    """Health check for Kubernetes probes"""
    return {"status": "healthy"}
