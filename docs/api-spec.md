# Image Converter API 명세서

## 개요

Image Converter API는 이미지 형식 변환, 크기 조정, 품질 최적화 기능을 제공하는 RESTful API입니다.

- **Base URL**: `http://localhost:8000`
- **API Version**: v1
- **Content-Type**: `application/json` (일반), `multipart/form-data` (파일 업로드)

## 인증

현재 버전에서는 인증이 필요하지 않습니다. (Public API)

---

## 엔드포인트

### 1. 헬스 체크

#### `GET /health`

서버 상태를 확인합니다.

**응답**
```json
{
  "status": "healthy"
}
```

**상태 코드**
- `200 OK`: 서버 정상 작동

---

### 2. 지원 형식 조회

#### `GET /api/v1/formats`

지원하는 이미지 형식 목록을 조회합니다.

**응답**
```json
{
  "supported_formats": ["webp", "jpeg", "jpg", "png"],
  "input_formats": ["webp", "jpeg", "jpg", "png", "bmp", "tiff"]
}
```

**응답 필드**
- `supported_formats`: 변환 출력으로 지원하는 형식
- `input_formats`: 입력으로 지원하는 형식

**상태 코드**
- `200 OK`: 성공

---

### 3. 이미지 변환

#### `POST /api/v1/convert`

이미지를 지정된 형식으로 변환합니다.

**요청 (multipart/form-data)**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `file` | File | ✅ | 변환할 이미지 파일 |
| `target_format` | string | ✅ | 변환할 형식 (webp, jpeg, jpg, png) |
| `max_width` | integer | ❌ | 최대 너비 (px) |
| `max_height` | integer | ❌ | 최대 높이 (px) |
| `max_size_mb` | float | ❌ | 최대 파일 크기 (MB) |
| `quality` | integer | ❌ | 이미지 품질 (1-100, 기본값: 100) |

**요청 예제 (curl)**
```bash
curl -X POST "http://localhost:8000/api/v1/convert" \
  -F "file=@example.jpg" \
  -F "target_format=webp" \
  -F "max_width=1920" \
  -F "max_height=1080" \
  -F "quality=90"
```

**요청 예제 (JavaScript)**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('target_format', 'webp');
formData.append('max_width', '1920');
formData.append('quality', '90');

const response = await fetch('/api/v1/convert', {
  method: 'POST',
  body: formData
});

const blob = await response.blob();
```

**응답**
- **Content-Type**: `image/{target_format}`
- **Body**: 변환된 이미지 바이너리 데이터

**응답 헤더**
- `Content-Disposition`: `attachment; filename=converted.{format}`
- `X-Original-Size`: 원본 파일 크기 (bytes)
- `X-Converted-Size`: 변환된 파일 크기 (bytes)
- `X-Compression-Ratio`: 압축률 (0.0-1.0)

**상태 코드**
- `200 OK`: 변환 성공
- `400 Bad Request`: 잘못된 요청 (파일 형식 오류 등)
- `500 Internal Server Error`: 서버 내부 오류

**오류 응답 예제**
```json
{
  "detail": "Invalid image file"
}
```

---

## 데이터 모델

### ConversionRequest

```typescript
interface ConversionRequest {
  target_format: "webp" | "jpeg" | "jpg" | "png";
  max_width?: number;        // > 0
  max_height?: number;       // > 0
  max_size_mb?: number;      // > 0
  quality?: number;          // 1-100
}
```

### ImageMetadata

```typescript
interface ImageMetadata {
  original_format: string;
  converted_format: string;
  original_size: number;           // bytes
  converted_size: number;          // bytes
  original_dimensions: [number, number];  // [width, height]
  converted_dimensions: [number, number]; // [width, height]
  compression_ratio: number;       // 0.0-1.0
}
```

---

## 사용 예제

### 1. 기본 형식 변환

```bash
# JPEG를 WebP로 변환
curl -X POST "http://localhost:8000/api/v1/convert" \
  -F "file=@photo.jpg" \
  -F "target_format=webp" \
  -o "photo.webp"
```

### 2. 크기 조정과 함께 변환

```bash
# 이미지를 PNG로 변환하면서 최대 크기 제한
curl -X POST "http://localhost:8000/api/v1/convert" \
  -F "file=@large-image.jpg" \
  -F "target_format=png" \
  -F "max_width=800" \
  -F "max_height=600" \
  -o "resized-image.png"
```

### 3. 파일 크기 최적화

```bash
# 파일 크기를 1MB 이하로 압축
curl -X POST "http://localhost:8000/api/v1/convert" \
  -F "file=@big-photo.jpg" \
  -F "target_format=jpeg" \
  -F "max_size_mb=1.0" \
  -o "compressed-photo.jpg"
```

### 4. 품질 조정

```bash
# 고품질 WebP 변환
curl -X POST "http://localhost:8000/api/v1/convert" \
  -F "file=@image.png" \
  -F "target_format=webp" \
  -F "quality=95" \
  -o "high-quality.webp"
```

---

## 제한사항

- **최대 파일 크기**: 50MB
- **지원 형식**: WebP, JPEG, JPG, PNG, BMP, TIFF (입력), WebP, JPEG, JPG, PNG (출력)
- **동시 요청**: 제한 없음 (현재 버전)
- **요청 타임아웃**: 30초

---

## 오류 코드

| 상태 코드 | 설명 | 해결 방법 |
|-----------|------|-----------|
| 400 | 잘못된 이미지 파일 | 지원하는 형식의 이미지 파일을 업로드하세요 |
| 400 | 잘못된 매개변수 | 요청 매개변수를 확인하세요 |
| 413 | 파일 크기 초과 | 50MB 이하의 파일을 업로드하세요 |
| 500 | 이미지 변환 실패 | 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다 |
| 500 | 서버 내부 오류 | 잠시 후 다시 시도하거나 관리자에게 문의하세요 |

---

## 변경 이력

### v0.1.0 (2025-06-11)
- 초기 API 구현
- 이미지 형식 변환 기능
- 크기 조정 및 품질 최적화 기능
- 지원 형식 조회 API

---

## 연락처

- **개발팀**: rlaxowl5460@gmail.com
- **이슈 리포트**: [GitHub Issues](https://github.com/KKamJi98/image-converter/issues)
- **API 문서**: http://localhost:8000/docs (Swagger UI)
