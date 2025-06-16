# Build stage
FROM node:20-alpine as build

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# Production stage
FROM docker.io/nginx:alpine

# curl 설치 (헬스체크용)
RUN apk add --no-cache curl

# 빌드된 파일 복사
COPY --from=build /app/build /usr/share/nginx/html

# Nginx 설정 템플릿 복사
COPY nginx.conf /etc/nginx/templates/default.conf.template

# 기본 백엔드 엔드포인트
ENV BACKEND_ENDPOINT=http://localhost:8000/api

# 포트 노출
EXPOSE 80

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
