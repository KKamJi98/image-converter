# Image Converter Project – Agent Guide

프로젝트 개요: 사용자가 Frontend에 이미지를 업로드하고 옵션을 선택하면, Backend의 변환 API가 이미지를 변환해 반환하는 구조입니다.

아래 규칙을 엄격히 준수해 작업하세요. 완료된 요구사항은 문서에 반영합니다.

## Features

- 부드러운 진행률 애니메이션
- 모든 형식에서 품질 슬라이더 노출(기본값 100)
- 변환 작업을 별도 스레드에서 실행해 타임아웃 감소
- JPG 요청 시 JPEG 형식으로 올바르게 저장
- WebP ↔ JPEG/PNG/JPG 양방향 지원
- 이미지 크기 조정(비율 유지, 최대 너비/높이)
- 파일 크기 제한(최대 Size MB 이하로 자동 압축)

## Rules

### 코드 포맷팅

- Backend(Python): black + isort + pytest
  - `uv`로 가상환경 사용, `requirements*.txt`로 의존성 관리
- Frontend(React/TS): prettier + eslint(airbnb-ts)
- CI에서 포맷/린트 실패 시 빌드 실패

### 사전 검증

- 원격 저장소로 푸시하기 전에 프론트엔드/백엔드 테스트와 린트·포맷 체커(`npm run test`, `npm run lint`, `npm run format:check`, `pytest`, `black --check`, `isort --check-only`)가 모두 통과했음을 반드시 확인하고 필요 시 실행 로그를 남긴다.

### CI 파이프라인

- GitHub Actions 단일 워크플로우(`.github/workflows/ci.yml`)
- 순서: 1) test → 2) lint/format-check → 3) build images → 4) push to Harbor → 5) Helm values 갱신
- Frontend(Jest+RTL)·Backend(Pytest) 모두 통과 시 진행
- `run_and_test.sh`로 e2e 헬스체크
- Harbor 시크릿: `HARBOR_USERNAME`, `HARBOR_PASSWORD`, `HARBOR_REGISTRY`, `HARBOR_PROJECT`

### 테스트 자동화

- Backend: pytest + pytest-asyncio + httpx
- Frontend: jest + @testing-library/react

### 문서화

- `README.md`: 프로젝트 개요/아키텍처/실행/배포/설정
- `frontend/README.md`: 구조, 컴포넌트, 개발 가이드
- `backend/README.md`: API 구조, 엔드포인트, 개발 가이드
- `infra/README.md`: 배포 가이드, Helm 차트
- `docs/api-spec.md`: API 명세(요청/응답/예제) – 변경 시 갱신

### 개발 환경

- Backend: Python 3.13+, uv
- Backend(옵션): libvips + pyvips 경로 지원
- Frontend: Node 20+
- Infra: Kubernetes 1.30+, Helm v3, Harbor
- Runtime: Docker

### 컨테이너 빌드 메모(Alpine)
- 백엔드 Dockerfile은 `python:3.13-alpine`을 사용하며 다음 개발 패키지를 설치합니다.
  - build-base, musl-dev, python3-dev, libffi-dev, pkgconfig
  - jpeg-dev, zlib-dev, freetype-dev, lcms2-dev, libwebp-dev, tiff-dev, tcl-dev, tk-dev
  - vips, vips-dev
- 이유: Alpine( musl ) 환경에서는 일부 파이썬 패키지가 소스 빌드를 시도하므로 C 헤더(`assert.h` 등)와 Python/FFI 헤더가 필요합니다.

### 배포 구조

- `frontend/`, `backend/`, `infra/` 루트 구성
- `infra/helm-chart`: Deployment, Service, Ingress, HPA, PDB 포함
- Harbor: `harbor.kkamji.net`
- 서비스 도메인: `image-converter.kkamji.net`
- 실제 배포 values: `infra/helm-chart/kkamji_values.yaml`

### 커밋 컨벤션

- 예: `feat: add image resize endpoint`, `fix: handle png transparency`, `docs: update README`
- 커밋은 영어로 간결하게(제목 72자 이내 권장)

### 코드 품질

- SOLID, DRY, KISS 원칙
- FastAPI + Pydantic v2, React 함수형 컴포넌트/훅 사용
- 모든 PR은 최소 1개 테스트 추가 또는 업데이트

## Problem & Requirements

- CI에서 컨테이너 이미지 태그를 컴포넌트 접두어 + 날짜/해시 기반으로 생성하고 Harbor에 push
  - `backend-YYYYMMDD-<hash>`, `frontend-YYYYMMDD-<hash>`
- 마지막 단계에서 Helm `kkamji_values.yaml`의 `backend.image.tag`, `frontend.image.tag`를 각 컴포넌트 태그로 갱신(워크플로우에 반영됨)

## Improvements Applied

- 동시 처리 제한: 제한된 `ThreadPoolExecutor` + `asyncio.Semaphore`로 과도한 동시 인코딩 방지
- 대형 이미지 안전장치: `Image.MAX_IMAGE_PIXELS`로 디컴프레션 폭탄/메모리 초과 예방
- 리사이즈 최적화: 큰 비율 축소 시 `BOX/BILINEAR` 사용, `thumbnail(reducing_gap)` 경로로 메모리/CPU 비용 완화
- 파일 크기 제한 이진 탐색: 인코딩 횟수 감소로 처리 시간/CPU 사용 최적화

### 환경 변수

- `IMAGE_WORKERS`(기본 2): 변환용 ThreadPoolExecutor 워커 수
- `CONVERTER_MAX_CONCURRENCY`(기본 2): 동시에 허용되는 변환 작업 수
- `SPOOL_THRESHOLD_MB`(기본 4): 입력/출력 스풀 임계값(초과 시 디스크 스풀)
- `MAX_IMAGE_PIXELS`(기본 0): 0 이하이면 제한 해제, 필요 시에만 지정
- `USE_VIPS`: 기본 1(활성). `0|false`로 비활성화 시 Pillow 경로 사용
- `VIPS_CONCURRENCY`: libvips 내부 스레드 수
