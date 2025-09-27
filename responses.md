# 개선 내용 요약

프로덕션에서 대용량 이미지 변환 시 CPU/메모리 사용 급증으로 Pod OOMKill 또는 CPU throttling이 발생할 수 있는 문제를 다음과 같이 개선했습니다.

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

## 추가 메모

- CI 파이프라인은 기존 구조를 유지하되, Helm values 자동 갱신 단계가 포함되어 있습니다. 태그 전략은 Harbor 리포지토리별 동일 태그(`YYYYMMDD-<hash>`)를 사용하며, 리포지토리 분리(`backend/`, `frontend/`)로 충돌을 피합니다.
