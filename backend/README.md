# Backend - Image Converter API

FastAPI 기반의 이미지 변환 및 최적화 API 서버입니다.

## 🏗️ 아키텍처

```
app/
├── api/                    # API 라우터
│   └── images.py              # 이미지 변환 엔드포인트
├── models/                 # Pydantic 모델
│   └── image_models.py        # 요청/응답 모델
├── services/               # 비즈니스 로직
│   └── image_converter.py     # 이미지 변환 서비스
└── main.py                # FastAPI 앱 진입점

tests/                     # 테스트 코드
├── test_main.py              # 메인 API 테스트
└── test_image_converter.py   # 이미지 변환 서비스 테스트
```

## 🛠️ 기술 스택

- **FastAPI** - 고성능 웹 프레임워크
- **Pillow (PIL)** - 이미지 처리 라이브러리
- **Pydantic** - 데이터 검증 및 직렬화
- **Poetry** - 의존성 관리
- **Pytest** - 테스트 프레임워크
- **Uvicorn** - ASGI 서버

## 🚀 개발 환경 설정

### 요구사항
- Python 3.12+
- Poetry

### 설치 및 실행
```bash
# Poetry 설치 (없는 경우)
curl -sSL https://install.python-poetry.org | python3 -

# 의존성 설치
poetry install

# 개발 서버 실행
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 테스트 실행
poetry run pytest

# 코드 포맷팅
poetry run black .
poetry run isort .

# 코드 품질 검사
poetry run black --check .
poetry run isort --check-only .
```

### 환경 변수
```bash
# .env
PYTHONPATH=/app
```

## 📝 API 엔드포인트

### 1. 헬스 체크
- **GET** `/health` - 서버 상태 확인

### 2. 이미지 변환
- **POST** `/api/v1/convert` - 이미지 형식 변환
- **GET** `/api/v1/formats` - 지원 형식 조회

자세한 API 명세는 [API 문서](../docs/api-spec.md)를 참조하세요.

## 🔧 핵심 컴포넌트

### 1. ImageConverter 서비스

```python
class ImageConverter:
    """이미지 변환 처리 클래스"""
    
    async def convert_image(self, image_data: bytes, request: ConversionRequest) -> Tuple[bytes, ImageMetadata]:
        """이미지 변환 수행"""
        # 1. 이미지 로드 및 EXIF 회전 보정
        # 2. 크기 조정 (비율 유지)
        # 3. 형식 변환 및 품질 조정
        # 4. 파일 크기 최적화
        # 5. 메타데이터 생성
```

**주요 기능:**
- **형식 변환**: WebP ↔ JPEG/PNG/JPG
- **크기 조정**: 비율 유지하며 최대 크기 제한
- **품질 최적화**: 1-100% 품질 조정
- **파일 크기 제한**: 지정된 크기 이하로 압축
- **EXIF 처리**: 자동 회전 보정

### 2. Pydantic 모델

```python
class ConversionRequest(BaseModel):
    """이미지 변환 요청 모델"""
    target_format: str
    max_width: Optional[int] = None
    max_height: Optional[int] = None
    max_size_mb: Optional[float] = None
    quality: Optional[int] = 85

class ImageMetadata(BaseModel):
    """이미지 메타데이터"""
    original_format: str
    converted_format: str
    original_size: int
    converted_size: int
    original_dimensions: tuple[int, int]
    converted_dimensions: tuple[int, int]
    compression_ratio: float
```

## 🧪 테스트

### 테스트 구조
```
tests/
├── test_main.py                 # API 엔드포인트 테스트
└── test_image_converter.py      # 이미지 변환 로직 테스트
```

### 테스트 실행
```bash
# 모든 테스트 실행
poetry run pytest

# 상세 출력
poetry run pytest -v

# 커버리지 포함
poetry run pytest --cov=app

# 특정 테스트 파일
poetry run pytest tests/test_main.py
```

### 테스트 예제
```python
@pytest.mark.asyncio
async def test_basic_conversion(converter, sample_image_data):
    """기본 이미지 변환 테스트"""
    request = ConversionRequest(target_format="webp")
    
    converted_data, metadata = await converter.convert_image(sample_image_data, request)
    
    assert len(converted_data) > 0
    assert metadata.converted_format == "webp"
    assert metadata.original_dimensions == (100, 100)
```

## 🔍 이미지 처리 세부사항

### 지원 형식
- **입력**: WebP, JPEG, JPG, PNG, BMP, TIFF
- **출력**: WebP, JPEG, JPG, PNG

### 크기 조정 알고리즘
```python
def _resize_image(self, image: Image.Image, request: ConversionRequest) -> Image.Image:
    """이미지 크기 조정 (비율 유지)"""
    # 1. 원본 크기 확인
    # 2. 최대 크기 비율 계산
    # 3. Lanczos 리샘플링으로 고품질 크기 조정
    # 4. 원본보다 큰 경우 크기 조정 생략
```

### 품질 최적화
```python
async def _optimize_file_size(self, image: Image.Image, request: ConversionRequest, max_size_mb: float) -> bytes:
    """파일 크기 제한에 맞춰 품질 조정"""
    # 1. 초기 품질로 변환
    # 2. 파일 크기 확인
    # 3. 크기 초과 시 품질 10씩 감소
    # 4. 최대 10번 시도 후 최소 품질 적용
```

### 투명도 처리
- **PNG → JPEG**: 흰색 배경으로 합성
- **RGBA → RGB**: 알파 채널 제거
- **WebP**: 투명도 유지

## 🚀 성능 최적화

### 메모리 관리
- 스트림 기반 이미지 처리
- 임시 파일 사용 최소화
- 가비지 컬렉션 최적화

### 처리 속도
- Pillow 최적화 옵션 사용
- 비동기 처리 지원
- 효율적인 리샘플링 알고리즘

## 📦 의존성 관리

### pyproject.toml
```toml
[tool.poetry.dependencies]
python = "^3.12"
fastapi = "^0.104.1"
uvicorn = {extras = ["standard"], version = "^0.24.0"}
pillow = "^10.1.0"
python-multipart = "^0.0.6"
pydantic = "^2.5.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.3"
pytest-asyncio = "^0.21.1"
black = "^23.11.0"
isort = "^5.12.0"
httpx = "^0.25.2"
```

### 코드 품질 도구
- **Black**: 코드 포맷터
- **isort**: import 정렬
- **Pytest**: 테스트 프레임워크

## 🐛 오류 처리

### 일반적인 오류
```python
# 잘못된 이미지 파일
raise HTTPException(status_code=400, detail="Invalid image file")

# 이미지 변환 실패
raise HTTPException(status_code=500, detail=f"Image conversion failed: {str(e)}")
```

### 로깅
```python
import logging

logger = logging.getLogger(__name__)
logger.error(f"Image conversion error: {str(e)}")
```

## 🔧 확장 가능성

### 새로운 형식 추가
1. `ImageConverter.supported_formats`에 형식 추가
2. PIL 지원 확인
3. 테스트 케이스 추가

### 새로운 기능 추가
1. `app/services/`에 새 서비스 클래스 생성
2. `app/api/`에 새 라우터 추가
3. `app/models/`에 필요한 모델 정의
4. 테스트 코드 작성

### 성능 개선
- Redis 캐싱 추가
- 백그라운드 작업 큐 (Celery)
- 이미지 CDN 연동

## 🐛 트러블슈팅

### 일반적인 문제

1. **PIL 설치 오류**
   ```bash
   # 시스템 의존성 설치 (Ubuntu/Debian)
   sudo apt-get install libjpeg-dev zlib1g-dev libfreetype6-dev
   ```

2. **메모리 부족**
   - 큰 이미지 처리 시 메모리 사용량 증가
   - 파일 크기 제한 설정 권장

3. **형식 지원 오류**
   - Pillow 버전 확인
   - 지원하지 않는 형식 요청 시 400 오류

## 🤝 기여하기

1. 새로운 API 추가 시 OpenAPI 스키마 자동 생성 확인
2. 모든 함수에 타입 힌트 추가
3. 비동기 함수 사용 권장
4. 테스트 커버리지 90% 이상 유지

## 📞 지원

- **API 문서**: http://localhost:8000/docs (Swagger UI)
- **이슈 리포트**: [GitHub Issues](https://github.com/your-repo/image-convertor/issues)
- **개발 문의**: team@example.com
