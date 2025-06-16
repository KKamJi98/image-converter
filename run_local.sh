#!/bin/bash

# 로컬 개발 환경용 실행 스크립트
set -e

echo "🚀 Image Converter 로컬 개발 환경 실행 (by TaeJi Kim)"

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

# Python 버전 확인
PYTHON_VERSION=$(python --version)
if [[ "$PYTHON_VERSION" != *"3.13"* ]]; then
    log_info "⚠️ Python 3.13이 필요합니다. 현재 버전: $PYTHON_VERSION"
    log_info "Python 3.13을 설치하거나 계속 진행하세요."
fi

# 실행 방식 선택
echo "실행 방식을 선택하세요:"
echo "1) 컨테이너로 실행 (Docker)"
echo "2) 로컬에서 직접 실행 (가상환경)"
read -p "선택 (기본값: 2): " choice

if [ -z "$choice" ] || [ "$choice" = "2" ]; then
    # 로컬에서 직접 실행
    log_info "로컬에서 직접 실행합니다."
    
    # 백엔드 실행
    log_info "백엔드 실행 중..."
    cd backend
    if [ ! -d ".venv" ]; then
        log_info "가상환경이 없습니다. 가상환경을 생성합니다."
        python -m venv .venv
        source .venv/bin/activate
        pip install --upgrade pip setuptools wheel
        pip install --only-binary=:all: pillow==11.2.1
        pip install -r requirements.txt
        pip install -r requirements-dev.txt
        
        # app/__init__.py 파일 생성
        mkdir -p app
        cat > app/__init__.py << EOF
"""Image Converter Backend Application.

Created by TaeJi Kim <rlaxowl5460@gmail.com>
"""

__version__ = "0.1.0"
__author__ = "TaeJi Kim"
__email__ = "rlaxowl5460@gmail.com"
EOF
    else
        source .venv/bin/activate
    fi
    
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    cd ..
    
    # 프론트엔드 실행
    log_info "프론트엔드 실행 중..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    # 종료 시 프로세스 정리
    function cleanup {
        log_info "프로세스 정리 중..."
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    }
    
    trap cleanup EXIT
    
    log_success "서비스가 실행 중입니다."
    echo "- Frontend: http://localhost:3000"
    echo "- Backend API: http://localhost:8000"
    echo "- API 문서: http://localhost:8000/docs"
    echo "종료하려면 Ctrl+C를 누르세요."
    
    # 메인 프로세스가 종료되지 않도록 대기
    wait
else
    # 컨테이너로 실행 (Docker 사용)
    CONTAINER_CMD=""
    COMPOSE_CMD=""
    COMPOSE_FILE="docker-compose.yml"

    if command -v docker &> /dev/null; then
        CONTAINER_CMD="docker"
        if command -v docker-compose &> /dev/null; then
            COMPOSE_CMD="docker-compose"
        elif $CONTAINER_CMD compose version &> /dev/null; then
            COMPOSE_CMD="$CONTAINER_CMD compose"
        else
            log_error "Docker Compose가 설치되지 않음"
        fi
    else
        log_error "Docker가 설치되지 않음"
    fi

    # 서비스 실행
    log_info "서비스 시작 중..."
    $COMPOSE_CMD -f $COMPOSE_FILE up --build

    log_success "서비스가 실행되었습니다!"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:8000"
    echo "API 문서: http://localhost:8000/docs"
fi
