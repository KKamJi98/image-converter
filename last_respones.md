# 개선 내용 요약

프로덕션에서 대용량 이미지 변환 시 CPU/메모리 사용 급증으로 Pod OOMKill 또는 CPU throttling이 발생할 수 있는 문제를 다음과 같이 개선했습니다.

## 2025-09-27 개선 사항

- 변환 시간이 90초를 초과하며 프론트엔드에서 타임아웃이 발생하던 문제를 해결하기 위해 backend/frontend의 CPU limit를 환경에 맞춰 조정할 수 있도록 구성했습니다. 기본 배포값(kkamji_values.yaml)에서는 `limits: null`로 설정해 클러스터가 낮은 기본 limit를 주입하더라도 쉽게 제거하거나 필요 시 높은 값으로 오버라이드할 수 있게 했습니다.
- `/tmp` emptyDir를 노드 디스크 기반으로 사용하고 `TMPDIR` + `VIPS_TMPDIR`를 `/tmp`로 지정하여 libvips의 임시 파일 경로를 명확히 하였으며, pyvips INFO 로그를 WARNING 레벨로 하향해 `O_TMPFILE failed!` 노이즈를 억제했습니다.
- FastAPI 변환 엔드포인트에 처리 시간 및 이미지 크기를 포함한 상세 로그를 추가하여 대용량 이미지 처리 지표를 실시간으로 관찰할 수 있도록 했습니다.

## 핵심 개선점

- 동시 처리 제한: 변환 작업에 `asyncio.Semaphore`와 제한된 기본 ThreadPoolExecutor를 적용해 과도한 동시 인코딩을 방지합니다.
- 대형 이미지 안전장치(기본 해제): 기본적으로 픽셀 하드 리밋은 해제하고(`MAX_IMAGE_PIXELS<=0`), 필요 시에만 환경변수로 활성화할 수 있도록 했습니다. 보안상 필요하거나 특정 워크로드에서만 제한을 적용하세요.
- 리사이즈 효율화: 큰 비율 축소 시 `BOX/BILINEAR`를 사용하고 `thumbnail(reducing_gap)`을 활용하여 downscale 경로를 최적화했습니다. JPEG의 경우 `draft()` 힌트를 제공하여 디코더 단계에서 조기 다운스케일을 시도합니다.
- 메모리 피크 억제: 입력·출력 모두 `SpooledTemporaryFile`을 사용하여 일정 크기 이상은 디스크로 스풀링해 피크 메모리 사용량을 낮춥니다(`SPOOL_THRESHOLD_MB`).
- 파일 크기 제한 최적화: 품질 탐색을 선형(10 단위 감소)에서 이진 탐색으로 변경해, 목표 크기 도달까지의 인코딩 횟수를 줄였습니다.
- 선택적 libvips 경로: `USE_VIPS=1` 설정 시 pyvips 기반 스트리밍 파이프라인을 사용하여 초대형 이미지에서도 낮은 메모리 사용량으로 안정 처리합니다. JPEG의 경우 progressive/품질 옵션 지원.

## 설정 방법

- 환경변수로 런타임에서 조정 가능합니다.
  - `IMAGE_WORKERS`(기본: 2): 백엔드 변환에 사용하는 ThreadPoolExecutor 워커 수.
  - `CONVERTER_MAX_CONCURRENCY`(기본: 2): 동시에 허용되는 변환 작업 수.
  - `SPOOL_THRESHOLD_MB`(기본: 4): 입력/출력 스풀 임계값. 초과 시 디스크로 스풀링.
  - `MAX_IMAGE_PIXELS`(기본: 0): 0 이하이면 제한 해제. 필요 시에만 값 지정.
  - `USE_VIPS`(기본: off): `1|true` 로 설정하면 libvips 파이프라인 사용.
  - `VIPS_CONCURRENCY`(기본: 2): libvips 내부 스레드 수.

## 기대 효과

- 피크 CPU 사용률 하락: 제한된 워커 + 세마포어로 동시 인코딩 폭주 방지.
- 메모리 사용량 완화: 초대형 이미지도 스풀링 + 조기 다운스케일로 메모리 피크 억제(하드 리밋 없이도 안전성 확보).
- 처리 지연 변동성 감소: 이진 탐색으로 불필요한 재인코딩 횟수 축소.

## 변경 파일

- `backend/app/services/image_converter.py`: 동시성 제한, 입력/출력 스풀링, JPEG draft, 리사이즈 최적화, 품질 이진 탐색, PNG/WebP 저장 옵션 조정.
- `backend/app/main.py`: 제한된 ThreadPoolExecutor 설정 및 수명주기 관리.
- `AGENTS.md`: 규칙 및 CI 요구사항 정리(기존 GEMINI.md를 개명).
- `.gitignore`: `AGENTS.md` 추가.

---

## CI 이슈 기록: isort 실패(Import ordering)

- 증상: GitHub Actions에서 `isort --check-only`가 `backend/app/main.py`, `backend/app/services/image_converter.py`의 import 정렬 오류로 실패.
- 원인:
  - `main.py`: 써드파티(FastAPI)와 퍼스트파티(`app.api`) import 사이에 공백 라인이 없어 그룹 구분 규칙(profile=black) 미준수.
  - `services/image_converter.py`: `from PIL import Image, ImageOps, ImageFile`의 import 이름 순서가 알파벳 기준 정렬 규칙과 불일치.
- 조치:
  - `main.py`: 써드파티와 퍼스트파티 import 사이에 공백 라인 추가, 모든 import를 모듈 상단으로 정리.
  - `services/image_converter.py`: `from PIL import Image, ImageFile, ImageOps`로 정렬 수정 및 import 그룹 정리.
- 결과: 로컬/CI에서 `isort --check-only` 및 `black --check` 통과 확인. 기능 변경 없음(스타일 수정).

---

## Deprecation 해결: FastAPI on_event → lifespan 마이그레이션

- 증상: `app.on_event("startup"|"shutdown")` 사용으로 FastAPI 0.115에서 DeprecationWarning 발생.
- 조치: `contextlib.asynccontextmanager` 기반 `lifespan` 컨텍스트를 도입하여 ThreadPoolExecutor 설정/종료를 관리.
- 변경 파일: `backend/app/main.py`
- 기대 효과: 경고 제거, 최신 FastAPI 권장 패턴 준수, 수명주기 관리 단일화.

## 추가 메모

- CI 파이프라인은 기존 구조를 유지하되, Helm values 자동 갱신 단계가 포함되어 있습니다. 태그 전략은 Harbor 리포지토리별 동일 태그(`YYYYMMDD-<hash>`)를 사용하며, 리포지토리 분리(`backend/`, `frontend/`)로 충돌을 피합니다.

---

## Docker Alpine 빌드 오류 해결(pyvips: assert.h 누락)

- 증상: Alpine 기반 백엔드 이미지 빌드 중 `pyvips@2.2.3` 설치 단계에서 `assert.h` 누락으로 `gcc` 빌드 실패.
- 원인: Alpine은 glibc가 아닌 musl을 사용하며, manylinux 휠이 제공되지 않는 경우 소스 빌드가 필요합니다. 이때 `musl-dev`(assert.h 포함), `python3-dev`, `libffi-dev`, `build-base` 등이 필요합니다.
- 조치: Dockerfile에 다음 패키지를 추가 설치하여 빌드 통과.
  - build-base, musl-dev, python3-dev, libffi-dev, pkgconfig
  - vips, vips-dev(런타임/헤더), Pillow 관련 이미지 라이브러리(jpeg-dev, zlib-dev, freetype-dev, lcms2-dev, libwebp-dev, tiff-dev), tcl-dev, tk-dev
- 결과: uv 기반 `pip install -r requirements.txt` 성공, 컨테이너 빌드 통과.
