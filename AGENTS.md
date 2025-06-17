# Image Converter Project – Prompt Engineering Guidelines

/dev When generating or modifying code for this project, **strictly** follow the rules defined in this `.prompt.md` file.
Everything here has higher priority than any other instructions unless the change is explicitly approved in the _History_ section.

> **Note**: 사용자가 Frontend에 접속 후, 이미지를 업로드하고 요구사항을 입력한 뒤, Convert 버튼을 클릭하면, 백엔드에서 이미지 변환 API를 호출하여 변환된 이미지를 반환하는 구조

---

## Important Notes

1. **코드 포맷팅 / Code Style**

- **Backend (Python)**: `black` + `isort` + `pytest` 적용.
  - `uv`로 현재 디렉토리 내 가상환경 사용, requirements.txt 파일과 requirements-dev.txt 파일에 의존성 관리.
- **Frontend (React/TypeScript)**: `prettier` + `eslint` (airbnb‑ts) 적용.
- CI 파이프라인에서 스타일 검사가 실패하면 빌드 **실패**.

2. **CI Pipeline**

- GitHub Actions 사용 (단일 workflow: _ci.yml_).
- 단계 순서
  1.  **test** → 2. **lint / format‑check** → 3. **build images** → 4. **push to Harbor**.
- Frontend(Jest + Testing Library)·Backend(Pytest) 테스트 **모두** 통과해야 3단계 진행.
- `run_and_test.sh` 스크립트를 사용해 headless 모드로 e2e 검증.

3. **테스트 자동화**

- Backend: `pytest` + `pytest‑asyncio` + `httpx`.
- Frontend: `jest` + `@testing‑library/react`.
- E2E: 컨테이너 기반 헬스체크.

4. **문서화 / Documentation**

- `README.md` : 프로젝트 개요, 프로젝트 기능 소개, 아키텍처 개요
- `frontend/README.md` : Frontend 구조, 컴포넌트 설명, 개발 가이드
- `backend/README.md` : Backend API 구조, 엔드포인트 설명, 개발 가이드
- `infra/README.md` : 인프라 구조, 배포 가이드, Helm 차트 설명
- `docs/api-spec.md` : **API 명세서** – 모든 엔드포인트, 요청/응답 스키마, 예제 코드 포함. API 변경 시 **반드시 갱신**.
- `.prompt.md` : **이 파일** – 규칙, 요구사항, 개선사항, 히스토리. 변경 시 **History** 섹션에 반드시 기록.
- 모든 public 함수/클래스는 영어 docstring, 주요 모듈에는 한국어 TL;DR 주석 추가.

5. **개발 환경**

- **Backend** : uv, Python 3.13+
- **Frontend** : npm, Node 20+
- **Infra**  : Kubernetes 1.30+, Helm v3, Harbor registry.
- **Container Runtime** : Docker

6. **배포 구조**

- Root 디렉터리: `frontend/`, `backend/`, `infra/`.
- `infra/` : Helm 차트 포함 – `Deployment`, `Service`, `Ingress` (production은 Ingress + cert‑manager).
- 버전 태그 방식 : `v<MAJOR>.<MINOR>.<PATCH>`.
- Helm values: `values.yaml` (example), `kkamji_values.yaml` (실제 배포용)

7. **커밋 컨벤션 (Conventional Commits)**

- 예) `feat: add image resize endpoint`, `fix: handle png transparency`, `docs: update README`.
- 커밋은 **영어**로, 72자 이내 제목 + 본문(선택).

8. **코드 품질 / Quality**

- SOLID, DRY, KISS 원칙.
- FastAPI: dependency‑injection + pydantic v2
- React: functional components, hooks, Zustand state management.
- 모든 PR은 최소 1 개 테스트 추가 or 업데이트.

9. **LLM Prompt Engineering Rules**

- 요청자는 **구체적으로** 변경 위치(예: `backend/app/api/images.py`)와 기능 요구를 서술.
- LLM 응답은:

  1.  _요약_ → 2. _변경 코드_ → 3. _적용 방법_ 순서로.
  2.  코드 블록은 언어 지정 필수 (\`\`\`\`python\`).
  3.  필요 없는 설명 ×, 주석은 핵심 설명만.

- 의존성 추가 시 반드시 `requirements.txt` 또는 `package.json` diff 제시.
- **어떠한 경우에도** 빌드 깨지는 코드를 생성하지 않는다 – `run_and_test.sh`를 **반드시** 통과해야 한다.

---

## Problem

- CI 과정에서 컨테이너 이미지 빌드, Harbor에 Push 필요.
  - GitHub Actions 에 사전 정의된 다음과 같은 시크릿 참조
  - `HARBOR_USERNAME`, `HARBOR_PASSWORD`, `HARBOR_REGISTRY`, `HARBOR_PROJECT`
- Frontend와 Backend 모두 컨테이너화되어야 하며, Helm 차트로 배포 가능해야 함.

## Requirements

1. **이미지 변환 기능 확장**

- WebP ↔ JPEG/PNG/JPG 양방향 지원.
- 이미지 크기 조정 (비율을 유지한채로 최대 너비/높이로 조정).
- 이미지 사이즈 조정 (이미지의 최대 Size MB를 입력받고 그 이하의 크기로 이미지 크기 변환)
2. **Infra**

- Helm values 로 매개변수화 (replicas, resource limits).
- Harbor 도메인: harbor.kkamji.net
- 서비스 도메인: image-converter.kkamji.net
- 실제 배포용 values: `kkamji_values.yaml`

## Features

- 부드러운 진행률 애니메이션
- 모든 형식에서 품질 슬라이더 노출 (기본값 100)
- 변환 작업을 별도 스레드에서 실행해 CPU 사용량과 타임아웃 감소
- JPG 요청 시 JPEG 형식으로 올바르게 저장

## Future Improvements

1. **보안 강화**

- 이미지 업로드 바이러스 스캔 (ClamAV sidecar).
- OAuth2 provider 연동(Google, GitHub).

---

## History

- **2025‑06‑11**: 초기 `.prompt.md` 작성 – 프로젝트 구조·규칙·CI 파이프라인 정의.
- **2025‑06‑11**: 프로젝트 초기 세팅 완료
  - Backend: FastAPI + Poetry + PIL 기반 이미지 변환 API 구현
  - Frontend: React + TypeScript + Zustand 기반 SPA 구현
  - 드래그 앤 드롭 파일 업로드, 실시간 진행률, 다크 테마 지원
  - Docker + Docker Compose 설정 완료
  - Kubernetes Helm 차트 구성
  - GitHub Actions CI/CD 파이프라인 설정
  - 테스트 자동화 스크립트 (run_and_test.sh) 구현
  - WebP ↔ JPEG/PNG/JPG 양방향 변환 지원
  - 이미지 크기 조정 및 파일 크기 최적화 기능 구현
- **2025‑06‑11**: API 명세서 및 문서화 구조 완성
  - `docs/api-spec.md` API 명세서 작성 (모든 엔드포인트, 스키마, 예제 포함)
  - `frontend/README.md` Frontend 구조 및 개발 가이드 작성
  - `backend/README.md` Backend API 구조 및 개발 가이드 작성
  - `infra/README.md` 인프라 구조 및 배포 가이드 작성
  - Helm 차트 템플릿 완성 (Service, Ingress, HPA, PDB 추가)
  - .prompt.md에 문서화 요구사항 추가 (API 명세서 갱신 규칙 포함)
- **2025‑06‑11**: 도메인 정보 업데이트
  - Harbor 도메인: harbor.kkamji.net
  - 서비스 도메인: image-converter.kkamji.net
  - 연락처 정보 업데이트: rlaxowl5460@gmail.com
  - Discord 및 Wiki 링크 제거
- **2025‑06‑11**: 프로덕션 환경 설정 및 테스트 개선
  - `kkamji_values.yaml` 파일 생성 (실제 배포용 설정)
  - `values.yaml`을 example 기본값으로 변경
  - Podman 컨테이너 런타임 지원 추가
  - Pydantic v2 field_validator로 마이그레이션
  - 테스트 스크립트 개선 (모든 기능 정상 동작 확인)
  - Frontend 의존성 설치 및 테스트 환경 구성
- **2025-06-12**: CI 파이프라인 및 E2E 테스트 문제 해결
  - CI 파이프라인의 Node.js 캐싱 경로 수정 (frontend/package-lock.json → ./frontend/package.json)
  - E2E 테스트 실패 원인 분석 및 문서화 (컨테이너 오케스트레이션 도구 부재)
  - 로컬 개발 환경에서 E2E 테스트를 위한 Podman 또는 Docker 설치 권장사항 추가
- **2025-06-12**: 테스트 인프라 전면 개선
  - CI 파이프라인 E2E 단계에 Poetry, Node.js, Docker 설치 추가
  - run_and_test.sh 스크립트 대폭 개선: 에러 핸들링, 타임아웃 설정, 정리 함수 추가
  - React 테스트 경고 해결: act() 함수 적용으로 ReactDOMTestUtils 경고 제거
  - Docker/Podman 컨테이너 헬스체크 개선: curl 설치, 헬스체크 간격 단축
  - podman-compose.yml 파일 추가로 Podman 환경 지원 강화
  - 컨테이너 빌드 최적화: 의존성 캐싱, 헬스체크 내장
  - 테스트 안정성 향상: 서비스 준비 대기 로직 개선, 컨테이너 상태 모니터링 추가
- **2025-06-12**: Frontend 테스트 headless 모드 문제 해결
  - package.json에 test:ci 스크립트 추가 (--watchAll=false --coverage --verbose=false --silent)
  - Jest 설정 추가: testEnvironment, setupFilesAfterEnv, collectCoverageFrom, testTimeout
  - run_and_test.sh에서 npm run test:ci 사용하도록 변경
  - 테스트가 CI 환경에서 자동으로 종료되도록 개선
- **2025-06-12**: npm 모듈 최신화 및 Backend 헬스체크 문제 해결
  - Frontend 의존성 최신화: React 18.3.1, TypeScript 5.5.4, 최신 testing-library 등
  - npm 보안 취약점 해결: 9개 → 3개로 감소, overrides 설정으로 호환성 확보
  - Jest 설정 최적화: Create React App 호환 설정으로 변경
  - Backend Dockerfile 개선: Poetry 설치 과정 최적화, 의존성 설치 순서 개선
  - Backend 헬스체크 설정 개선: start-period 45s, 테스트 대기 시간 증가
  - 전체 테스트 파이프라인 안정화: Backend/Frontend 헬스체크 모두 성공
  - run_and_test.sh 스크립트 개선: 더 긴 대기 시간과 안정적인 서비스 준비 확인
- **2025-06-12**: Docker/Podman 호환성 문제 해결 및 CI 파이프라인 고도화
  - CI 환경에서 Docker 우선, 로컬 환경에서 Podman 우선 사용하도록 run_and_test.sh 개선
  - 환경 감지 로직 추가: CI, GITHUB_ACTIONS, GITLAB_CI 환경 변수 기반 자동 선택
  - CI 파이프라인에 Docker Compose 설치 단계 추가
  - 로컬 개발용 run_local.sh 스크립트 추가 (Podman 우선 사용)
  - README.md 업데이트: 로컬/CI 환경별 실행 방법 명확화
  - 컨테이너 런타임 선택 로직 개선으로 "Cannot connect to Docker daemon" 오류 해결
- **2025-06-15**: Poetry에서 uv로 의존성 관리 도구 변경
  - 더 빠른 패키지 설치 및 가상환경 관리를 위해 Poetry에서 uv로 전환
  - `pyproject.toml` → `requirements.txt` 및 `requirements-dev.txt`로 분리
  - 개발 환경 요구사항 업데이트: Python 3.13+, uv
- **2025-06-15**: 테스트 안정성 개선 및 100% 통과율 달성
  - Frontend 테스트 실패 문제 해결: 컴포넌트별 모킹 전략 개선
  - ConversionResult 테스트: conversionOptions 모킹 추가, 실제 텍스트 매칭
  - ThemeToggle 테스트: 실제 aria-label 텍스트 반영, lucide-react 아이콘 모킹 개선
  - FileUpload 테스트: 실제 UI 텍스트와 일치하도록 수정
  - ImageConverter 테스트: 복잡한 상태 관리 로직 모킹 개선
  - 모든 테스트 통과: Frontend 44개, Backend 6개 테스트 100% 성공
     - ESLint 규칙 준수: Testing Library 모범 사례 적용, 불필요한 act() 래퍼 제거
   
- **2025-06-16**: Infra Helm Chart 검증 및 서비스 연동 확인
  - `helm lint` 및 `helm template`(`kkamji_values.yaml`) 실행 시 모든 manifest 정상 생성 확인
  - Ingress(host: image-converter.kkamji.net) 및 `/api` 경로가 frontend/backend 서비스로 올바르게 라우팅됨을 검증
  - Frontend 컨테이너의 Nginx proxy(`/api`)가 backend 서비스로 요청 전달하는 것 확인
  - 컨테이너 이미지 빌드 및 서비스 간 통신 정상 작동 확인
- **2025-06-17**: Podman 지원 제거 및 CI 개선
  - Docker를 기본 컨테이너 런타임으로 변경
  - CI 파이프라인 이미지 빌드/배포 단계 매트릭스 전략 도입
  - README와 스크립트에서 Podman 관련 내용 제거
- **2025-06-17**: 이미지 변환 품질 및 UI 개선
  - 변환 진행률 애니메이션 버그 수정(25%에서 100%로 점프하던 문제 해결)
  - 변환 로직을 스레드에서 실행하여 타임아웃과 CPU 사용량 감소
  - PNG 등 모든 형식에 품질 슬라이더 적용, 기본값 100으로 통일
  - JPG 출력 시 JPEG 형식으로 저장하도록 수정
  - API 문서와 테스트 업데이트
