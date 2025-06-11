# Frontend - Image Converter

React + TypeScript 기반의 이미지 변환 웹 애플리케이션입니다.

## 🏗️ 아키텍처

```
src/
├── components/          # React 컴포넌트
│   ├── ImageConverter.tsx    # 메인 컨버터 컴포넌트
│   ├── FileUpload.tsx        # 파일 업로드 (드래그 앤 드롭)
│   ├── ConversionOptions.tsx # 변환 옵션 설정
│   ├── ConversionProgress.tsx # 진행률 표시
│   ├── ConversionResult.tsx  # 결과 표시 및 다운로드
│   ├── ThemeToggle.tsx       # 다크/라이트 테마 토글
│   └── __tests__/           # 컴포넌트 테스트
├── stores/             # Zustand 상태 관리
│   ├── imageStore.ts        # 이미지 변환 상태
│   └── themeStore.ts        # 테마 상태
├── services/           # API 서비스
│   └── imageService.ts      # 이미지 변환 API 호출
├── App.tsx            # 메인 앱 컴포넌트
├── index.tsx          # 앱 진입점
└── index.css          # 글로벌 스타일 (CSS Variables)
```

## 🛠️ 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Zustand** - 경량 상태 관리
- **React Dropzone** - 드래그 앤 드롭 파일 업로드
- **Axios** - HTTP 클라이언트
- **Lucide React** - 아이콘 라이브러리
- **CSS Variables** - 테마 시스템

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#2563eb` (Blue)
- **Success**: `#10b981` (Green)
- **Error**: `#ef4444` (Red)
- **Warning**: `#f59e0b` (Amber)

### 테마 지원
- **Light Theme**: 기본 밝은 테마
- **Dark Theme**: 다크 모드 지원
- CSS Variables를 통한 동적 테마 전환

### 반응형 디자인
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: 767px 이하

## 🚀 개발 환경 설정

### 요구사항
- Node.js 20+
- npm 또는 yarn

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 빌드
npm run build

# 테스트 실행
npm test

# 린팅
npm run lint

# 포맷팅
npm run format
```

### 환경 변수
```bash
# .env.local
REACT_APP_API_URL=http://localhost:8000
```

## 📱 주요 기능

### 1. 파일 업로드
- 드래그 앤 드롭 지원
- 클릭하여 파일 선택
- 이미지 미리보기
- 파일 크기 및 형식 표시

### 2. 변환 옵션
- **출력 형식**: WebP, JPEG, PNG, JPG
- **품질 조정**: 1-100% (JPEG, WebP)
- **크기 조정**: 최대 너비/높이 설정
- **파일 크기 제한**: MB 단위 설정

### 3. 진행률 표시
- 실시간 변환 진행률
- 단계별 상태 메시지
- 애니메이션 효과

### 4. 결과 표시
- 변환된 이미지 미리보기
- 변환 정보 표시 (형식, 품질, 크기 등)
- 다운로드 버튼
- 다시 변환 버튼

## 🧪 테스트

### 테스트 구조
```
src/
├── App.test.tsx                    # 앱 전체 테스트
└── components/
    └── __tests__/
        └── FileUpload.test.tsx     # 컴포넌트 테스트
```

### 테스트 실행
```bash
# 모든 테스트 실행
npm test

# 커버리지 포함
npm test -- --coverage

# 특정 파일 테스트
npm test FileUpload.test.tsx
```

## 🎯 상태 관리

### Image Store (imageStore.ts)
```typescript
interface ImageState {
  selectedFile: File | null;           // 선택된 파일
  conversionOptions: ConversionOptions; // 변환 옵션
  progress: ConversionProgress;        // 진행률 상태
  convertedImageUrl: string | null;    // 변환된 이미지 URL
  error: string | null;               // 오류 메시지
}
```

### Theme Store (themeStore.ts)
```typescript
interface ThemeState {
  theme: 'light' | 'dark';  // 현재 테마
  toggleTheme: () => void;  // 테마 전환 함수
}
```

## 🔧 커스터마이징

### 새로운 컴포넌트 추가
1. `src/components/` 에 컴포넌트 파일 생성
2. 해당 CSS 파일 생성 (선택사항)
3. `__tests__/` 에 테스트 파일 추가
4. 메인 컴포넌트에서 import 및 사용

### 새로운 상태 추가
1. `src/stores/` 에 Zustand 스토어 생성
2. 타입 정의 및 초기 상태 설정
3. 액션 함수 구현
4. 컴포넌트에서 사용

### 스타일 수정
1. `src/index.css` 에서 CSS Variables 수정
2. 컴포넌트별 CSS 파일에서 세부 스타일 조정
3. 반응형 미디어 쿼리 추가

## 📦 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### Docker 빌드
```bash
docker build -t image-converter-frontend .
```

### 정적 파일 서빙
빌드된 파일은 `build/` 디렉토리에 생성되며, 정적 파일 서버로 서빙할 수 있습니다.

## 🐛 트러블슈팅

### 일반적인 문제

1. **API 연결 오류**
   - `REACT_APP_API_URL` 환경 변수 확인
   - 백엔드 서버 실행 상태 확인

2. **파일 업로드 실패**
   - 파일 크기 제한 (50MB) 확인
   - 지원하는 이미지 형식 확인

3. **빌드 오류**
   - Node.js 버전 확인 (20+)
   - `node_modules` 삭제 후 재설치

## 🤝 기여하기

1. 새로운 기능 추가 시 테스트 코드 작성 필수
2. ESLint 및 Prettier 규칙 준수
3. 컴포넌트는 함수형으로 작성
4. TypeScript 타입 정의 필수

## 📞 지원

- **이슈 리포트**: [GitHub Issues](https://github.com/your-repo/image-convertor/issues)
- **개발 문의**: team@example.com
