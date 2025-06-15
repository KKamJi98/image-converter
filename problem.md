# CI 파이프라인 오류 해결 보고서

## 🚨 발생한 문제

### 오류 메시지
```
error: No virtual environment found; run `uv venv` to create an environment, or pass `--system` to install into a non-virtual environment
Error: Process completed with exit code 2.
```

### 오류 발생 위치
- **파일**: `.github/workflows/ci.yml`
- **단계**: `Install backend dependencies`
- **명령어**: `uv pip install -e .`

## 🔍 문제 원인 분석

### 1. 가상환경 부재
- **원인**: CI 환경에서 `uv pip install` 명령어를 실행할 때 가상환경이 생성되지 않은 상태
- **상세**: `uv`는 기본적으로 가상환경 내에서 패키지를 설치하도록 설계되어 있음
- **영향**: 패키지 설치 단계에서 CI 파이프라인이 실패

### 2. Python 버전 호환성 문제
- **원인**: `pyproject.toml`에서 `requires-python = ">=3.13"` 설정
- **CI 환경**: Python 3.13 사용
- **결과**: 버전 요구사항과 CI 환경 일치로 호환성 확보

### 3. 개발 의존성 누락
- **원인**: 테스트 및 린팅 도구들이 `dev` 그룹에 정의되어 있으나 설치되지 않음
- **영향**: `pytest`, `black`, `isort` 등의 도구를 찾을 수 없어 후속 단계 실패

## ✅ 해결 방법

### 1. 가상환경 생성 및 활성화
```yaml
- name: Create virtual environment and install backend dependencies
  working-directory: backend
  run: |
    uv venv                           # 가상환경 생성
    source .venv/bin/activate         # 가상환경 활성화
    uv pip install -e . --extra dev   # 개발 의존성 포함 설치
```

### 2. Python 버전 호환성 수정
```toml
# pyproject.toml
requires-python = ">=3.13"  # CI 환경과 일치하도록 유지
```

### 3. 모든 백엔드 관련 단계에서 가상환경 활성화
```yaml
- name: Run backend tests
  working-directory: backend
  run: |
    source .venv/bin/activate
    pytest

- name: Run backend linting
  working-directory: backend
  run: |
    source .venv/bin/activate
    black --check .
    isort --check-only .
```

### 4. 개발 의존성 명시적 설치
- `--extra dev` 플래그 추가로 테스트 및 린팅 도구 설치 보장

## 🔧 적용된 변경사항

### 파일: `.github/workflows/ci.yml`
1. **test 작업**: 가상환경 생성 및 활성화 로직 추가
2. **lint 작업**: 가상환경 생성 및 활성화 로직 추가
3. **모든 백엔드 명령어**: 가상환경 활성화 후 실행

### 파일: `backend/pyproject.toml`
1. **Python 버전 요구사항**: CI 환경과 일치하도록 `>=3.13` 유지

## 🧪 검증 방법

### 로컬 테스트
```bash
# 백엔드 디렉토리에서
cd backend
uv venv
source .venv/bin/activate
uv pip install -e . --extra dev
pytest
black --check .
isort --check-only .
```

### CI 파이프라인 확인
1. GitHub Actions에서 모든 작업이 성공적으로 완료되는지 확인
2. 각 단계별 로그에서 가상환경 활성화 메시지 확인
3. 테스트 및 린팅 결과 정상 출력 확인

## 📚 학습 포인트

### uv 도구 특성
- `uv`는 현대적인 Python 패키지 관리 도구로 가상환경 사용을 강제함
- CI 환경에서는 명시적으로 가상환경을 생성하고 활성화해야 함

### CI/CD 모범 사례
- 의존성 설치 시 개발 도구도 함께 설치하여 일관성 보장
- Python 버전 호환성을 CI 환경과 맞춰 설정
- 각 단계에서 필요한 환경 설정을 명시적으로 수행

### 대안 해결책
만약 가상환경 사용이 불가능한 경우, `--system` 플래그 사용 가능:
```bash
uv pip install -e . --system --extra dev
```

## 🎯 결론

이번 문제는 `uv` 도구의 가상환경 요구사항과 CI 환경의 특성을 제대로 이해하지 못해서 발생했습니다. 해결을 통해 다음을 얻었습니다:

1. **안정적인 CI 파이프라인**: 모든 단계가 일관된 환경에서 실행
2. **버전 호환성 확보**: Python 3.12 환경에서 정상 동작
3. **완전한 의존성 관리**: 개발 도구까지 포함한 전체 의존성 설치

이제 CI 파이프라인이 안정적으로 실행되어 코드 품질과 테스트 커버리지를 보장할 수 있습니다.
