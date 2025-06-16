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
    cleanup_on_error
    exit 1
}

# 에러 발생 시 정리 함수
cleanup_on_error() {
    log_info "에러 발생으로 인한 정리 작업 중..."
    
    # 실행 중인 컨테이너 정리 (강제 종료 및 삭제)
    if [ -n "$COMPOSE_CMD" ] && [ -f "$COMPOSE_FILE" ]; then
        $COMPOSE_CMD -f $COMPOSE_FILE down --remove-orphans 2>/dev/null || true
        $COMPOSE_CMD -f $COMPOSE_FILE rm -f 2>/dev/null || true
    fi
    
    # 개별 컨테이너 정리 (이름으로 강제 삭제)
    if [ -n "$CONTAINER_CMD" ]; then
        $CONTAINER_CMD stop image-convertor_backend_1 image-convertor_frontend_1 2>/dev/null || true
        $CONTAINER_CMD rm -f image-convertor_backend_1 image-convertor_frontend_1 2>/dev/null || true
    fi
    
    # 테스트 이미지 정리
    if [ -n "$CONTAINER_CMD" ]; then
        $CONTAINER_CMD rmi localhost/image-converter-backend:test localhost/image-converter-frontend:test 2>/dev/null || true
    fi
}

# 타임아웃 설정
TIMEOUT=60
BUILD_TIMEOUT=300
HEALTH_TIMEOUT=60

# 1. Backend 테스트
log_info "Backend 테스트 시작..."
cd backend

if command -v uv &> /dev/null; then
    log_info "uv로 의존성 설치 중..."

    # 로컬 가상환경 생성 후 의존성 설치
    if [ ! -d ".venv" ]; then
        uv venv
    fi
    uv pip install -r requirements.txt || log_error "Backend 의존성 설치 실패"
    uv pip install -r requirements-dev.txt || log_error "Backend dev 의존성 설치 실패"
    source .venv/bin/activate
    
    log_info "Backend 테스트 실행 중..."
    timeout $TIMEOUT pytest -v --tb=short || log_error "Backend 테스트 실패"
    
    log_info "Backend 코드 포맷팅 검사 중..."
    timeout $TIMEOUT black --check . || log_error "Backend 코드 포맷팅 검사 실패"
    timeout $TIMEOUT isort --check-only . || log_error "Backend import 정렬 검사 실패"
    
    log_success "Backend 테스트 완료"
else
    log_error "uv가 설치되지 않음. Backend 테스트를 실행할 수 없습니다."
fi

cd ..

# 2. Frontend 테스트
log_info "Frontend 테스트 시작..."
cd frontend

if command -v npm &> /dev/null; then
    log_info "NPM 의존성 확인 중..."
    if [ ! -d "node_modules" ]; then
        log_info "NPM 의존성 설치 중..."
        timeout 180 npm ci || log_error "Frontend 의존성 설치 실패"
    fi
    
    log_info "Frontend 테스트 실행 중..."
    timeout $TIMEOUT npm run test:ci || log_error "Frontend 테스트 실패"
    
    log_info "Frontend 린팅 검사 중..."
    timeout $TIMEOUT npm run lint || log_error "Frontend 린트 검사 실패"
    timeout $TIMEOUT npm run format:check || log_error "Frontend 포맷 검사 실패"
    
    log_success "Frontend 테스트 완료"
else
    log_error "NPM이 설치되지 않음. Frontend 테스트를 실행할 수 없습니다."
fi

cd ..

# 3. 컨테이너 빌드 테스트 (환경에 따른 런타임 선택)
log_info "컨테이너 이미지 빌드 테스트 시작..."

CONTAINER_CMD=""

if command -v docker &> /dev/null; then
    CONTAINER_CMD="docker"
else
    log_warning "Docker가 설치되어 있지 않음. 컨테이너 빌드 스킵"
fi

if [ -n "$CONTAINER_CMD" ]; then
    log_info "Backend 컨테이너 이미지 빌드 중..."
    timeout $BUILD_TIMEOUT $CONTAINER_CMD build -t localhost/image-converter-backend:test ./backend || log_error "Backend 컨테이너 빌드 실패"
    
    log_info "Frontend 컨테이너 이미지 빌드 중..."
    timeout $BUILD_TIMEOUT $CONTAINER_CMD build -t localhost/image-converter-frontend:test ./frontend || log_error "Frontend 컨테이너 빌드 실패"
    
    log_success "컨테이너 빌드 완료"
    
    # 4. E2E 테스트 (간단한 헬스체크)
    log_info "E2E 테스트 시작..."
    
    # 기존 컨테이너 정리 (E2E 테스트 시작 전)
    if [ -n "$CONTAINER_CMD" ]; then
        $CONTAINER_CMD stop image-convertor_backend_1 image-convertor_frontend_1 2>/dev/null || true
        $CONTAINER_CMD rm -f image-convertor_backend_1 image-convertor_frontend_1 2>/dev/null || true
    fi
    
    COMPOSE_CMD=""
    COMPOSE_FILE=""
    
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
        COMPOSE_FILE="docker-compose.yml"
    elif command -v docker &> /dev/null && $CONTAINER_CMD compose version &> /dev/null; then
        COMPOSE_CMD="$CONTAINER_CMD compose"
        COMPOSE_FILE="docker-compose.yml"
    fi
    
    if [ -n "$COMPOSE_CMD" ] && [ -f "$COMPOSE_FILE" ]; then
        log_info "서비스 시작 중..."
        $COMPOSE_CMD -f $COMPOSE_FILE up -d --build || log_error "컨테이너 서비스 실행 실패"
        
        # 서비스 준비 대기 (더 긴 대기 시간과 헬스체크)
        log_info "서비스 준비 대기 중..."
        sleep 15
        
        # 백엔드 서비스 준비 확인
        for i in {1..20}; do
            if $CONTAINER_CMD ps --format "table {{.Names}}\t{{.Status}}" | grep -q "Up"; then
                log_info "컨테이너가 실행 중입니다. 서비스 준비 확인 중... ($i/20)"
                if command -v curl &> /dev/null; then
                    if timeout 10 curl -f http://localhost:8000/health &>/dev/null; then
                        log_success "Backend 서비스 준비 완료"
                        break
                    fi
                fi
                sleep 5
            else
                log_warning "컨테이너 상태 확인 중... ($i/20)"
                sleep 5
            fi
            
            if [ $i -eq 20 ]; then
                log_warning "서비스 준비 시간 초과"
            fi
        done
        
        # 헬스체크
        if command -v curl &> /dev/null; then
            log_info "Backend 헬스체크..."
            if timeout $HEALTH_TIMEOUT curl -f http://localhost:8000/health; then
                log_success "Backend 헬스체크 성공"
            else
                log_warning "Backend 헬스체크 실패"
            fi
            
            log_info "Frontend 헬스체크..."
            if timeout $HEALTH_TIMEOUT curl -f http://localhost:3000; then
                log_success "Frontend 헬스체크 성공"
            else
                log_warning "Frontend 헬스체크 실패"
            fi
        else
            log_warning "curl이 설치되지 않음. 헬스체크 스킵"
        fi
        
        # 컨테이너 로그 확인 (디버깅용)
        log_info "컨테이너 상태 확인..."
        $CONTAINER_CMD ps -a
        
        # 서비스 정리
        log_info "서비스 정리 중..."
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
