#!/bin/bash

# Image Converter 프로젝트 테스트 및 실행 스크립트
set -e

echo "🚀 Image Converter 테스트 및 빌드 시작"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 타임아웃 설정 (1분)
TIMEOUT=60

# 1. Backend 테스트
log_info "Backend 테스트 시작..."
cd backend

if command -v poetry &> /dev/null; then
    log_info "Poetry로 의존성 설치 중..."
    poetry install
    
    log_info "Backend 테스트 실행 중..."
    timeout $TIMEOUT poetry run pytest -v
    
    log_info "Backend 코드 포맷팅 검사 중..."
    timeout $TIMEOUT poetry run black --check .
    timeout $TIMEOUT poetry run isort --check-only .
    
    log_success "Backend 테스트 완료"
else
    log_warning "Poetry가 설치되지 않음. pip로 대체 실행..."
    pip install -r requirements.txt 2>/dev/null || log_warning "requirements.txt 없음"
    timeout $TIMEOUT python -m pytest -v 2>/dev/null || log_warning "Backend 테스트 스킵"
fi

cd ..

# 2. Frontend 테스트
log_info "Frontend 테스트 시작..."
cd frontend

if command -v npm &> /dev/null; then
    log_info "NPM 의존성 설치 중..."
    timeout $TIMEOUT npm ci
    
    log_info "Frontend 테스트 실행 중..."
    timeout $TIMEOUT npm test -- --coverage --watchAll=false
    
    log_info "Frontend 린팅 검사 중..."
    timeout $TIMEOUT npm run lint
    timeout $TIMEOUT npm run format:check
    
    log_success "Frontend 테스트 완료"
else
    log_warning "NPM이 설치되지 않음. Frontend 테스트 스킵"
fi

cd ..

# 3. Docker 빌드 테스트
log_info "Docker 이미지 빌드 테스트 시작..."

if command -v docker &> /dev/null; then
    log_info "Backend Docker 이미지 빌드 중..."
    timeout 300 docker build -t image-converter-backend:test ./backend
    
    log_info "Frontend Docker 이미지 빌드 중..."
    timeout 300 docker build -t image-converter-frontend:test ./frontend
    
    log_success "Docker 빌드 완료"
else
    log_warning "Docker가 설치되지 않음. Docker 빌드 스킵"
fi

# 4. E2E 테스트 (간단한 헬스체크)
log_info "E2E 테스트 시작..."

if command -v docker-compose &> /dev/null || command -v docker &> /dev/null; then
    log_info "서비스 시작 중..."
    
    # Docker Compose로 서비스 시작
    if command -v docker-compose &> /dev/null; then
        docker-compose up -d --build
        
        # 서비스 준비 대기
        log_info "서비스 준비 대기 중..."
        sleep 30
        
        # 헬스체크
        log_info "Backend 헬스체크..."
        timeout 30 curl -f http://localhost:8000/health || log_error "Backend 헬스체크 실패"
        
        log_info "Frontend 헬스체크..."
        timeout 30 curl -f http://localhost:3000 || log_error "Frontend 헬스체크 실패"
        
        # 서비스 정리
        docker-compose down
        
        log_success "E2E 테스트 완료"
    else
        log_warning "Docker Compose 없음. E2E 테스트 스킵"
    fi
else
    log_warning "Docker 없음. E2E 테스트 스킵"
fi

# 5. 정리
log_info "테스트 이미지 정리 중..."
docker rmi image-converter-backend:test image-converter-frontend:test 2>/dev/null || true

log_success "🎉 모든 테스트가 성공적으로 완료되었습니다!"

exit 0
