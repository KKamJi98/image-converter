"""
Image Converter Backend API
FastAPI 기반 이미지 변환 서비스

TL;DR: Bounded thread-pool + semaphore-based conversion to avoid
CPU/memory spikes with large images.
"""

import logging
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor

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


# 제한된 기본 ThreadPoolExecutor 설정
_executor: ThreadPoolExecutor | None = None


@app.on_event("startup")
async def on_startup() -> None:
    global _executor
    workers = int(os.getenv("IMAGE_WORKERS", "2"))
    logger.info("Setting default ThreadPoolExecutor with max_workers=%d", workers)
    _executor = ThreadPoolExecutor(max_workers=max(1, workers))
    loop = asyncio.get_running_loop()
    loop.set_default_executor(_executor)


@app.on_event("shutdown")
async def on_shutdown() -> None:
    global _executor
    if _executor is not None:
        logger.info("Shutting down ThreadPoolExecutor")
        _executor.shutdown(wait=True, cancel_futures=True)
        _executor = None
