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

## 개발 환경 설정

```bash
# 의존성 설치
poetry install

# 개발 서버 실행
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 테스트 실행
poetry run pytest

# 코드 포맷팅
poetry run black .
poetry run isort .
```

## 환경 변수

- `PYTHONPATH`: Python 모듈 경로 (기본값: `/app`)

## 기술 스택

- **FastAPI**: 웹 프레임워크
- **Pillow (PIL)**: 이미지 처리
- **Pydantic v2**: 데이터 검증
- **Poetry**: 의존성 관리
