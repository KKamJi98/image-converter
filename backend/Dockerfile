# Build Stage
FROM python:3.13-slim AS builder

WORKDIR /app

# Copy only application code and requirements files
COPY pyproject.toml ./
COPY requirements.txt ./
COPY requirements-dev.txt ./
COPY app ./app

# Runtime Stage (Alpine)
FROM python:3.13-alpine

WORKDIR /app

# Install build dependencies for Python packages (like Pillow) on Alpine
# These are needed to compile C extensions of Python packages
RUN apk add --no-cache \
    gcc \
    jpeg-dev \
    zlib-dev \
    freetype-dev \
    lcms2-dev \
    libwebp-dev \
    tcl-dev \
    tk-dev \
    libstdc++ \
    curl \
    && rm -rf /var/cache/apk/*

# uv 설치
RUN pip install uv

# Copy requirements and app code from builder stage
COPY --from=builder /app/pyproject.toml ./
COPY --from=builder /app/requirements.txt ./
COPY --from=builder /app/requirements-dev.txt ./
COPY --from=builder /app/app ./app

# Install Python dependencies using uv on Alpine
RUN uv pip install --system -r requirements.txt

# Environment variables
ENV PYTHONPATH=/app

# Expose port
EXPOSE 8000

# Healthcheck (curl is installed in Alpine stage)
HEALTHCHECK --interval=15s --timeout=10s --start-period=45s --retries=5 \
    CMD curl -f http://localhost:8000/health || exit 1

# Metadata
LABEL maintainer="TaeJi Kim <rlaxowl5460@gmail.com>"
LABEL version="0.1.0"
LABEL description="Image Converter Backend API"

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
