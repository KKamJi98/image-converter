# Changelog

## [1.1.0](https://github.com/KKamJi98/image-converter/compare/v1.0.0...v1.1.0) (2025-06-28)


### Features

* display converted image size ([f49a04e](https://github.com/KKamJi98/image-converter/commit/f49a04ed96fbec13392e454f5ae9c275319c0871))
* display converted image size ([bb1dce4](https://github.com/KKamJi98/image-converter/commit/bb1dce43ec49684d9cd47288f4f21581e0a1d3ac))
* extend image API timeout ([292dae5](https://github.com/KKamJi98/image-converter/commit/292dae584b0f1efa413079ee1020f809adaf6e1c))
* **frontend:** use bundled favicon ([3883262](https://github.com/KKamJi98/image-converter/commit/388326287d1e45a16cc17665db1ab81a3d6c5bfd))
* improve logging and clarify api base ([c0aa7c5](https://github.com/KKamJi98/image-converter/commit/c0aa7c55cd6d9d3bf9e364d01c2c0cbbd0cf658e))
* parameterize backend endpoint ([4bff853](https://github.com/KKamJi98/image-converter/commit/4bff853fe0209a0564dd794eefc8851fe91f520c))
* show converted image size in MB ([a4636fd](https://github.com/KKamJi98/image-converter/commit/a4636fd238e68bc898b7a3056e3647331b7031c4))
* show image size in KB or MB ([f89bc55](https://github.com/KKamJi98/image-converter/commit/f89bc5521ea36d7ffaafd8f391a59c1616a13332))
* support direct backend endpoint and docs path ([59024e1](https://github.com/KKamJi98/image-converter/commit/59024e1d6991d3d2344e606946d446d986c632a9))
* Update CI workflow and remove old agent files ([64748ed](https://github.com/KKamJi98/image-converter/commit/64748ed494b5e1b00a55faf9362195a670eb657b))


### Bug Fixes

* avoid replicas field with HPA ([f19253c](https://github.com/KKamJi98/image-converter/commit/f19253c37650122793702ae6d4c270c19d0ed2a7))
* **ci:** correct image tag format ([e4a53b8](https://github.com/KKamJi98/image-converter/commit/e4a53b8f96d9f99d49e7395c62177a7fe9c9c1af))
* correct api path and ingress rewrite ([4b9c45b](https://github.com/KKamJi98/image-converter/commit/4b9c45b22e70cadb916db6ae081342015a8b8b35))
* correct backend proxy path ([5564e8f](https://github.com/KKamJi98/image-converter/commit/5564e8fcdd3739cc608c7a7ba2d7a63e796db4aa))
* Disable Docker Hub push in CI build step ([8ca1691](https://github.com/KKamJi98/image-converter/commit/8ca169196c51e7927573f80f09f415b0b71579e5))
* improve logging and error handling ([079c7d3](https://github.com/KKamJi98/image-converter/commit/079c7d34b453a1b7278aec9ecc515618738a6d1d))
* Update backend Dockerfile to upgrade system packages for CVEs ([4e1e04b](https://github.com/KKamJi98/image-converter/commit/4e1e04ba0b7b429c1f254752d211921951c4fea6))
* update container image name and helm chart values ([62a400f](https://github.com/KKamJi98/image-converter/commit/62a400f721d7462a621b81d31f5fe288416de3a2))
* update helm endpoints and test script ([411b821](https://github.com/KKamJi98/image-converter/commit/411b8210157478350e4b13c13992bfca1519f3d5))


### Documentation

* add main page image ([a8fa8f8](https://github.com/KKamJi98/image-converter/commit/a8fa8f8dbd1b15343b58c2c1799995bb416a403c))
* update guidelines and readme ([2131388](https://github.com/KKamJi98/image-converter/commit/2131388a83317dcfcca396779ac912b881c66fac))
* update requirements ([45382f9](https://github.KKamJi98/image-converter/commit/45382f979066aed405d5fb22ffe4f7c45ae8ddfe))
* update requirements & setup scripts ([10d63eb](https://github.com/KKamJi98/image-converter/commit/10d63ebafa496e542d64a4b997eb5d1fb65d1bec))

## Previous History (from GEMINI.md)

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