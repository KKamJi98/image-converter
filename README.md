# Image Converter

![Main Page](assets/images/main-page.png)

이미지 변환 및 최적화 도구입니다. React + TypeScript 프론트엔드와 FastAPI 백엔드로 구성되어 있습니다.

## 🚀 주요 기능

- **다양한 형식 지원**: WebP, JPEG, PNG, JPG 간 양방향 변환
- **스마트 크기 조정**: 비율을 유지하면서 최대 너비/높이로 조정
- **파일 크기 최적화**: 지정된 크기 이하로 자동 압축
- **드래그 앤 드롭**: 직관적인 파일 업로드 인터페이스
- **실시간 진행률**: 부드러운 애니메이션으로 변환 과정을 표시
- **품질 조정**: 모든 형식에서 품질 슬라이더 사용, 기본값 100%
- **다크 테마**: 사용자 선호에 따른 테마 전환
- **반응형 디자인**: 모든 디바이스에서 최적화된 경험

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │   FastAPI       │
│   (Frontend)    │◄──►│   (Backend)     │
│                 │    │                 │
│ • TypeScript    │    │ • Python 3.13+  │
│ • Zustand       │    │ • PIL/Pillow    │
│ • Tailwind CSS  │    │ • Pydantic v2   │
└─────────────────┘    └─────────────────┘
```

## 🛠️ 기술 스택

### Frontend
- **React 18** + **TypeScript**
- **Zustand** - 상태 관리
- **React Dropzone** - 파일 업로드
- **Lucide React** - 아이콘
- **CSS Variables** - 테마 시스템

### Backend
- **FastAPI** - 웹 프레임워크
- **Pillow (PIL)** - 이미지 처리
- **libvips + pyvips (옵션)** - 저메모리 스트리밍 변환
- **Pydantic v2** - 데이터 검증
- **uv** - 의존성 관리

### DevOps
- **Docker** - 컨테이너 런타임
- **Kubernetes** + **Helm**
- **GitHub Actions** - CI/CD
- **Harbor** - 컨테이너 레지스트리

#### CI 이미지 태그
- CI는 다음 규칙으로 태그를 생성해 Harbor에 푸시합니다.
  - 백엔드: `backend-YYYYMMDD-<hash>`
  - 프론트엔드: `frontend-YYYYMMDD-<hash>`
- 이후 Helm `infra/helm-chart/kkamji_values.yaml`의 각 이미지 태그를 위 값으로 자동 갱신합니다.

## ⚡ 성능/안정성 개선

- 제한된 스레드 풀 + 세마포어로 변환 동시성 제어(스파이크 방지)
- 대형 이미지도 하드 제한 없이 안전 처리: 입력/출력 스풀링과 JPEG 디코더 `draft()`로 메모리 피크 억제
- 큰 비율 축소 시 비용 효율적인 리사이즈 경로 사용(thumbnail/reducing_gap)
- 파일 크기 제한 시 품질 이진 탐색으로 재인코딩 횟수 감소

## 🚀 빠른 시작

### 개발 환경 요구사항
- Python 3.13+
- Node.js 20+
 - uv
 - Docker (컨테이너 런타임)

### 로컬 개발

1. **저장소 클론**
```bash
git clone <repository-url>
cd image-converter
```

2. **셋업 스크립트 실행**
```bash
./setup.sh
```

3. **로컬 실행**
```bash
./run_local.sh
```

4. **브라우저에서 접속**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API 문서: http://localhost:8000/docs

### 컨테이너로 실행

#### 로컬 개발 환경
```bash
# 간편 실행 스크립트 (권장)
./run_local.sh

# 또는 직접 실행
docker-compose up --build
```

#### CI/CD 환경 (Docker 우선)
```bash
# 전체 테스트 및 빌드 (CI 환경에서 자동 감지)
./run_and_test.sh
```

#### libvips 경로 활성화(옵션)
```bash
# 컨테이너 실행 시 libvips 파이프라인 사용
docker run -e USE_VIPS=1 -e VIPS_CONCURRENCY=2 ...
```

#### Alpine 빌드 종속성(백엔드 이미지)
- Dockerfile은 `python:3.13-alpine` 기반으로, 다음 개발 패키지를 함께 설치하여 Pillow/pyvips 빌드 실패를 방지합니다.
  - build-base, musl-dev, python3-dev, libffi-dev, pkgconfig
  - jpeg-dev, zlib-dev, freetype-dev, lcms2-dev, libwebp-dev, tiff-dev, tcl-dev, tk-dev
  - vips, vips-dev
  - 사유: Alpine에서는 manylinux 휠 사용이 제한적이어서 일부 패키지가 소스 빌드를 시도하며, 이때 `assert.h`(musl-dev), Python 헤더(python3-dev), libffi-dev 등이 필요합니다.

## 🧪 테스트

### 전체 테스트 실행
```bash
./run_and_test.sh
```

### 개별 테스트
```bash
# 백엔드 테스트
cd backend
pytest

# 프론트엔드 테스트
cd frontend
npm test

# 코드 품질 검사
cd backend
black --check .
isort --check-only .

cd frontend
npm run lint
npm run format:check
```

## 📦 배포

### Kubernetes 배포

#### 개발/테스트 환경
```bash
# 기본 values.yaml 사용
helm install image-converter ./infra/helm-chart
```

#### 프로덕션 환경
```bash
# kkamji_values.yaml 사용
helm install image-converter ./infra/helm-chart \
  -f ./infra/helm-chart/kkamji_values.yaml
```

### 환경별 설정
- **개발/테스트**: `values.yaml` (example 기본값)
- **프로덕션**: `kkamji_values.yaml` (실제 배포용)

## 🔧 설정

### 환경 변수

#### Backend
- `PYTHONPATH`: Python 모듈 경로 (기본값: `/app`)
- `IMAGE_WORKERS`: 변환용 ThreadPoolExecutor 워커 수(기본: 2)
- `CONVERTER_MAX_CONCURRENCY`: 동시에 허용되는 변환 작업 수(기본: 2)
- `SPOOL_THRESHOLD_MB`: 입력/출력 스풀 임계값(기본: 4)
- `MAX_IMAGE_PIXELS`: 0 이하면 제한 해제, 필요 시만 지정(기본: 0)
- `USE_VIPS`: 기본 1(활성). `0|false`로 비활성화하면 Pillow 경로 사용
- `VIPS_CONCURRENCY`: libvips 내부 스레드 수(컨테이너 기본 2)

#### Frontend
- `REACT_APP_API_URL`: 백엔드 API URL (기본값: `/api`)
  - 이 값은 프록시 경로를 의미하므로 코드에서는 `/v1`과 같이 접미사만 사용합니다.
- `BACKEND_ENDPOINT`: 프록시가 요청을 전달할 백엔드 서비스 주소
  - Docker Compose: `http://backend:8000`
  - Helm: `http://image-converter-backend:8000`

### 도메인 설정

#### 프로덕션 환경
- **Harbor 레지스트리**: harbor.kkamji.net
- **서비스 도메인**: image-converter.kkamji.net

## 📝 API 문서

### 주요 엔드포인트

- `POST /api/v1/convert` - 이미지 변환
- `GET /api/v1/formats` - 지원 형식 조회
- `GET /health` - 헬스 체크

자세한 API 문서는 http://localhost:8000/docs 에서 확인할 수 있습니다.

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 커밋 컨벤션
- `feat:` 새로운 기능
- `fix:` 버그 수정
- `docs:` 문서 변경
- `style:` 코드 포맷팅
- `refactor:` 코드 리팩토링
- `test:` 테스트 추가/수정
- `chore:` 빌드 프로세스 또는 보조 도구 변경

### 브랜치 및 Pull Request 규칙
- 모든 브랜치 이름과 Pull Request 제목은 **영어**로 작성합니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🐛 버그 리포트 & 기능 요청

이슈가 있거나 새로운 기능을 제안하고 싶으시면 [GitHub Issues](https://github.com/KKamJi98/image-converter/issues)를 이용해 주세요.

## 📞 지원

- 👨‍💻 개발자: TaeJi Kim
- 📧 Email: `rlaxowl5460@gmail.com`
