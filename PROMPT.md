## Goals

1. GEMINI.md 파일을 AGENTS.md 파일로 수정한 뒤, .gitignore에 추가
2. AGENTS.md 파일과 README.md 파일을 아래 작업을 진행한 뒤, 최신화하고 고도화 작업 진행
3. 아래 `## Context` 에 포함된 문제의 개선점에 대해 알아보고 해결하기
4. 모든 문제와 CI/CD, Test를 통과할 때까지 작업을 계속 진행, (CI/CD 파이프라인과, pre-commit-hook 확인)

## 개선점
1. 현재 Image Convertor 서비스를 사용해 이미지에 대한 형식 변환, 사이즈 조절에 대한 기능은 정상적으로 잘 동작하나, 이미지의 크기나 형식에 따라 메모리, 혹은 CPU 사용량이 너무 많이 사용되어 Pod가 죽거나 throttleing이 걸리는 경우가 있음.
2. 해당 문제를 해결하기 위한 여러가지 방법을 생각하고 개선한 뒤, 현재 어떤 방식을 어떻게 수정하여 어떻게 개선했는지에 대해 `last_respones.md` 파일에 남겨두기
