FROM python:3.13-slim

WORKDIR /app

# 시스템 의존성 설치 (curl 추가)
RUN apt-get update && apt-get upgrade -y && apt-get install -y     gcc     curl     libjpeg-dev     zlib1g-dev     libfreetype6-dev     liblcms2-dev     libwebp-dev     tcl8.6-dev     tk8.6-dev     python3-tk     && rm -rf /var/lib/apt/lists/*

# uv 설치
RUN pip install uv

# 환경 변수 설정
ENV PYTHONPATH=/app

# 의존성 파일들 복사
COPY pyproject.toml ./

# 애플리케이션 코드 복사
COPY . .

# 의존성 설치
RUN uv pip install --system -e .

# 포트 노출
EXPOSE 8000

# 헬스체크 추가 (더 긴 시작 대기 시간)
HEALTHCHECK --interval=15s --timeout=10s --start-period=45s --retries=5 \
    CMD curl -f http://localhost:8000/health || exit 1

# 메타데이터 추가
LABEL maintainer="TaeJi Kim <rlaxowl5460@gmail.com>"
LABEL version="0.1.0"
LABEL description="Image Converter Backend API"

# 애플리케이션 실행
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
