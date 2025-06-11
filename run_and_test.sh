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
    exit 1
}

# 타임아웃 설정 (1분)
TIMEOUT=60

# 1. Backend 테스트
log_info "Backend 테스트 시작..."
cd backend

if command -v poetry &> /dev/null; then
    log_info "Poetry로 의존성 설치 중..."
    poetry install || log_error "Backend 의존성 설치 실패"
    
    log_info "Backend 테스트 실행 중..."
    timeout $TIMEOUT poetry run pytest -v || log_error "Backend 테스트 실패"
    
    log_info "Backend 코드 포맷팅 검사 중..."
    timeout $TIMEOUT poetry run black --check . || log_error "Backend 코드 포맷팅 검사 실패"
    timeout $TIMEOUT poetry run isort --check-only . || log_error "Backend import 정렬 검사 실패"
    
    log_success "Backend 테스트 완료"
else
    log_error "Poetry가 설치되지 않음. Backend 테스트를 실행할 수 없습니다."
fi

cd ..

# 2. Frontend 테스트
log_info "Frontend 테스트 시작..."
cd frontend

if command -v npm &> /dev/null; then
    log_info "NPM 의존성 확인 중..."
    if [ ! -d "node_modules" ]; then
        log_info "NPM 의존성 설치 중..."
        timeout 180 npm install || log_error "Frontend 의존성 설치 실패"
    fi
    
    log_info "Frontend 테스트 실행 중..."
    CI=true timeout $TIMEOUT npm test || log_error "Frontend 테스트 실패"
    
    log_info "Frontend 린팅 검사 중..."
    timeout $TIMEOUT npm run lint || log_error "Frontend 린트 검사 실패"
    timeout $TIMEOUT npm run format:check || log_error "Frontend 포맷 검사 실패"
    
    log_success "Frontend 테스트 완료"
else
    log_error "NPM이 설치되지 않음. Frontend 테스트를 실행할 수 없습니다."
fi

cd ..

# 3. 컨테이너 빌드 테스트 (Podman 또는 Docker)
log_info "컨테이너 이미지 빌드 테스트 시작..."

CONTAINER_CMD=""
if command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
    log_info "Podman을 사용하여 이미지 빌드 중..."
elif command -v docker &> /dev/null; then
    CONTAINER_CMD="docker"
    log_info "Docker를 사용하여 이미지 빌드 중..."
else
    log_warning "Podman 또는 Docker가 설치되지 않음. 컨테이너 빌드 스킵"
fi

if [ -n "$CONTAINER_CMD" ]; then
    log_info "Backend 컨테이너 이미지 빌드 중..."
    timeout 300 $CONTAINER_CMD build -t localhost/image-converter-backend:test ./backend || log_error "Backend 컨테이너 빌드 실패"
    
    log_info "Frontend 컨테이너 이미지 빌드 중..."
    timeout 300 $CONTAINER_CMD build -t localhost/image-converter-frontend:test ./frontend || log_error "Frontend 컨테이너 빌드 실패"
    
    log_success "컨테이너 빌드 완료"
    
    # 4. E2E 테스트 (간단한 헬스체크)
    log_info "E2E 테스트 시작..."
    
    COMPOSE_CMD=""
    if command -v podman-compose &> /dev/null; then
        COMPOSE_CMD="podman-compose"
        COMPOSE_FILE="podman-compose.yml"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
        COMPOSE_FILE="docker-compose.yml"
    elif command -v docker &> /dev/null && $CONTAINER_CMD compose version &> /dev/null; then
        COMPOSE_CMD="$CONTAINER_CMD compose"
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    if [ -n "$COMPOSE_CMD" ] && [ -f "$COMPOSE_FILE" ]; then
        log_info "서비스 시작 중..."
        $COMPOSE_CMD -f $COMPOSE_FILE up -d --build || log_error "컨테이너 서비스 실행 실패"
        
        # 서비스 준비 대기
        log_info "서비스 준비 대기 중..."
        sleep 30
        
        # 헬스체크
        if command -v curl &> /dev/null; then
            log_info "Backend 헬스체크..."
            timeout 30 curl -f http://localhost:8000/health || log_warning "Backend 헬스체크 실패"
            
            log_info "Frontend 헬스체크..."
            timeout 30 curl -f http://localhost:3000 || log_warning "Frontend 헬스체크 실패"
        else
            log_warning "curl이 설치되지 않음. 헬스체크 스킵"
        fi
        
        # 서비스 정리
        $COMPOSE_CMD -f $COMPOSE_FILE down
        
        log_success "E2E 테스트 완료"
    else
        log_warning "컨테이너 오케스트레이션 도구가 없음. E2E 테스트 스킵"
    fi
    
    # 5. 정리
    log_info "테스트 이미지 정리 중..."
    $CONTAINER_CMD rmi localhost/image-converter-backend:test localhost/image-converter-frontend:test 2>/dev/null || true
fi

log_success "🎉 모든 테스트가 성공적으로 완료되었습니다!"

exit 0
