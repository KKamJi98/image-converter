#!/bin/bash
set -e

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

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

log_info "🚀 이미지 변환기 프로젝트 셋업 시작 (by TaeJi Kim)"

# 설치 모드 선택
echo "설치 모드를 선택하세요:"
echo "1) 일반 설치 (Python 가상환경 사용)"
echo "2) 컨테이너 설치 (Docker 사용)"
echo "3) 문제 해결 모드 (의존성 문제 해결)"
read -p "선택 (기본값: 1): " setup_mode

# 기본값 설정
if [ -z "$setup_mode" ]; then
    setup_mode="1"
fi

# 일반 설치 또는 문제 해결 모드
if [ "$setup_mode" = "1" ] || [ "$setup_mode" = "3" ]; then
    # Python 버전 확인
    PYTHON_VERSION=$(python --version)
    log_info "현재 Python 버전: $PYTHON_VERSION"

    # Python 3.13 확인
    if [[ "$PYTHON_VERSION" != *"3.13"* ]]; then
        log_warning "⚠️ Python 3.13이 필요합니다. 현재 버전: $PYTHON_VERSION"
        log_info "Python 3.13을 설치하는 것을 권장합니다."
        log_info "macOS에서는 다음 명령어로 설치할 수 있습니다:"
        log_info "brew install python@3.13"
        echo ""
        read -p "계속 진행하시겠습니까? (y/n): " choice
        if [[ "$choice" != "y" && "$choice" != "Y" ]]; then
            log_error "설치가 취소되었습니다."
        fi
    fi

    # uv 설치 확인 (문제 해결 모드에서는 pip 사용)
    if [ "$setup_mode" = "1" ]; then
        if ! command -v uv &> /dev/null; then
            log_info "🔧 uv 설치 중..."
            curl -LsSf https://astral.sh/uv/install.sh | sh
            log_success "✅ uv 설치 완료"
        fi
    fi

    # 백엔드 셋업
    log_info "🔧 백엔드 셋업 중..."
    cd backend

    # 기존 가상환경 제거 (있는 경우)
    if [ -d ".venv" ]; then
        log_info "기존 가상환경 제거 중..."
        rm -rf .venv
    fi

    # 가상환경 생성 및 패키지 설치
    log_info "🔧 가상환경 생성 및 패키지 설치 중..."
    
    if [ "$setup_mode" = "1" ]; then
        # 일반 설치 모드 - uv 사용
        uv venv
        uv pip install --only-binary=:all: pillow==11.2.1
        uv pip install -r requirements.txt
        uv pip install -r requirements-dev.txt
    else
        # 문제 해결 모드 - pip 사용
        python -m venv .venv
        source .venv/bin/activate
        pip install --upgrade pip setuptools wheel
        pip install --only-binary=:all: pillow==11.2.1
        pip install fastapi==0.104.1 uvicorn[standard]==0.24.0 python-multipart==0.0.6 httpx==0.25.2 pydantic==2.11.7
        
        # 개발 의존성 설치
        if [ -f "requirements-dev.txt" ]; then
            pip install -r requirements-dev.txt
        fi
        
        deactivate
    fi

    # app/__init__.py 파일 생성
    log_info "app/__init__.py 파일 생성 중..."
    mkdir -p app
    cat > app/__init__.py << EOF
"""Image Converter Backend Application.

Created by TaeJi Kim <rlaxowl5460@gmail.com>
"""

__version__ = "0.1.0"
__author__ = "TaeJi Kim"
__email__ = "rlaxowl5460@gmail.com"
EOF

    cd ..

    # 프론트엔드 셋업
    # Node.js 및 NPM 확인
    log_info "🔧 Node.js 및 NPM 확인 중..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_info "현재 Node.js 버전: $NODE_VERSION"
        NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v\([0-9]*\).*/\1/')
        if [ "$NODE_MAJOR" -lt 20 ]; then
            log_warning "Node.js 20 이상을 권장합니다. 현재 버전: $NODE_VERSION"
        fi
    else
        log_warning "Node.js가 설치되어 있지 않습니다. Node.js 20+ 설치를 권장합니다."
    fi
    if ! command -v npm &> /dev/null; then
        log_error "npm이 설치되어 있지 않습니다. Node.js와 npm을 설치하세요."
    fi

    # Helm 및 kubectl 확인 (선택 사항)
    log_info "🔧 Helm 및 kubectl 확인 중..."
    if command -v helm &> /dev/null; then
        HELM_VERSION=$(helm version --short)
        log_info "현재 Helm 버전: $HELM_VERSION"
        if [[ "$HELM_VERSION" != v3* ]]; then
            log_warning "Helm v3.x 버전을 권장합니다."
        fi
    else
        log_warning "Helm이 설치되어 있지 않습니다. infra 헬름 배포 시 설치를 권장합니다."
    fi
    if command -v kubectl &> /dev/null; then
        KUBE_VERSION=$(kubectl version --client --short)
        log_info "현재 kubectl 버전: $KUBE_VERSION"
    else
        log_warning "kubectl이 설치되어 있지 않습니다. 쿠버네티스 배포 시 설치를 권장합니다."
    fi

    # 프론트엔드 셋업
    log_info "🔧 프론트엔드 셋업 중..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        log_info "🔧 NPM 의존성 설치 중..."
        npm ci
    else
        log_info "npm 의존성 이미 설치됨"
    fi
    cd ..

    log_success "✅ 셋업 완료!"
    echo ""
    log_info "🚀 프로젝트 실행 방법:"
    echo "1. 백엔드 실행:"
    echo "   cd backend"
    echo "   source .venv/bin/activate  # 또는 Windows에서는 .venv\\Scripts\\activate"
    echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    echo ""
    echo "2. 프론트엔드 실행 (새 터미널에서):"
    echo "   cd frontend"
    echo "   npm start"
    echo ""
    echo "3. 브라우저에서 접속:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:8000"
    echo "   - API 문서: http://localhost:8000/docs"
    echo ""
    echo "4. 또는 다음 명령어로 한 번에 실행하세요:"
    echo "   ./run_local.sh"

# 컨테이너 설치 모드
elif [ "$setup_mode" = "2" ]; then
    log_info "🔧 컨테이너 기반 설치를 시작합니다..."
    
    # 컨테이너 런타임 감지 (Docker)
    CONTAINER_CMD=""

    if command -v docker &> /dev/null; then
        CONTAINER_CMD="docker"
        log_info "Docker를 사용합니다."
    else
        log_error "⚠️ Docker가 설치되어 있지 않습니다. 컨테이너 런타임을 설치하고 다시 시도하세요."
    fi

    # docker-compose.yml 파일 확인
    if [ -f "docker-compose.yml" ]; then
        COMPOSE_FILE="docker-compose.yml"
    else
        log_error "⚠️ docker-compose.yml 파일이 없습니다. 컴포즈 파일을 생성하고 다시 시도하세요."
    fi

    # 컴포즈 명령어 결정
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    elif $CONTAINER_CMD compose version &> /dev/null; then
        COMPOSE_CMD="$CONTAINER_CMD compose"
    else
        log_error "⚠️ Docker Compose가 설치되어 있지 않습니다. 설치 후 다시 시도하세요."
    fi

    log_info "🚀 $COMPOSE_CMD를 사용하여 서비스를 빌드합니다..."
    $COMPOSE_CMD -f $COMPOSE_FILE build

    log_success "✅ 컨테이너 빌드 완료!"
    echo ""
    log_info "🚀 프로젝트 실행 방법:"
    echo "다음 명령어로 서비스를 시작하세요:"
    echo "   $COMPOSE_CMD -f $COMPOSE_FILE up"
    echo ""
    echo "또는 다음 명령어로 한 번에 실행하세요:"
    echo "   ./run_local.sh"
    echo ""
    echo "브라우저에서 접속:"
    echo "   - Frontend: http://localhost:3000"
    echo "   - Backend API: http://localhost:8000"
    echo "   - API 문서: http://localhost:8000/docs"
else
    log_error "잘못된 선택입니다. 1, 2, 또는 3을 선택하세요."
fi
