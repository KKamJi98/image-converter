#!/bin/bash

# 로컬 개발 환경용 실행 스크립트 (Podman 우선)
set -e

echo "🚀 Image Converter 로컬 개발 환경 실행"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# 컨테이너 런타임 감지 (로컬 환경에서는 Podman 우선)
CONTAINER_CMD=""
COMPOSE_CMD=""
COMPOSE_FILE=""

if command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
    if command -v podman-compose &> /dev/null; then
        COMPOSE_CMD="podman-compose"
        COMPOSE_FILE="podman-compose.yml"
        log_info "Podman + Podman Compose 사용"
    else
        log_error "podman-compose가 설치되지 않음. 'pip install podman-compose' 실행 필요"
    fi
elif command -v docker &> /dev/null; then
    CONTAINER_CMD="docker"
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
        COMPOSE_FILE="docker-compose.yml"
        log_info "Docker + Docker Compose 사용"
    elif $CONTAINER_CMD compose version &> /dev/null; then
        COMPOSE_CMD="$CONTAINER_CMD compose"
        COMPOSE_FILE="docker-compose.yml"
        log_info "Docker + Docker Compose V2 사용"
    else
        log_error "Docker Compose가 설치되지 않음"
    fi
else
    log_error "Podman 또는 Docker가 설치되지 않음"
fi

# 서비스 실행
log_info "서비스 시작 중..."
$COMPOSE_CMD -f $COMPOSE_FILE up --build

log_success "서비스가 실행되었습니다!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API 문서: http://localhost:8000/docs"
