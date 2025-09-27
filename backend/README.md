# Image Converter Backend

FastAPI 기반의 이미지 변환 API 백엔드입니다.

## 주요 기능

- 이미지 형식 변환 (WebP, JPEG, PNG, JPG)
- 이미지 크기 조정
- 이미지 품질 최적화
- 파일 크기 제한

## API 엔드포인트

- `POST /api/v1/convert` - 이미지 변환
- `GET /api/v1/formats` - 지원 형식 조회
- `GET /health` - 헬스 체크

### 변환 응답 헤더

`/api/v1/convert`는 StreamingResponse로 이미지를 반환하며 다음과 같은 메타데이터 헤더를 포함합니다.

| 헤더 | 설명 |
| --- | --- |
| `Content-Disposition` | 다운로드 파일명(`converted.{확장자}`) |
| `X-Target-Format` | 변환된 결과 형식 |
| `X-Original-Size` / `X-Converted-Size` | 변환 전/후 파일 크기 (bytes) |
| `X-Compression-Ratio` | 압축률 (`converted / original`) |
| `X-Original-Width` / `X-Original-Height` | 원본 해상도 (px) |
| `X-Converted-Width` / `X-Converted-Height` | 변환된 해상도 (px) |
| `X-Process-Time` | 서버 처리 시간 (초) |

프론트엔드가 헤더를 읽을 수 있도록 CORS 미들웨어에서 `Access-Control-Expose-Headers`에 위 목록을 모두 추가했습니다.

## 개발 환경 설정

```bash
# 의존성 설치
uv pip install -e .

# 개발 서버 실행
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 테스트 실행
pytest

# 코드 포맷팅
black .
isort .
```

## 환경 변수

- `PYTHONPATH`: Python 모듈 경로 (기본값: `/app`)

## 기술 스택

- **FastAPI**: 웹 프레임워크
- **Pillow (PIL)**: 이미지 처리
- **Pydantic v2**: 데이터 검증
- **uv**: 의존성 관리
