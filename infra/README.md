# Infrastructure - Image Converter

Kubernetes 기반의 Image Converter 애플리케이션 배포 및 인프라 구성입니다.

## 🏗️ 아키텍처

```
infra/
└── helm-chart/                 # Helm 차트
    ├── Chart.yaml                 # 차트 메타데이터
    ├── values/
    │   └── values.yaml           # 기본 설정값
    └── templates/                # Kubernetes 매니페스트 템플릿
        ├── _helpers.tpl          # 헬퍼 템플릿
        ├── backend-deployment.yaml    # Backend 배포
        ├── backend-service.yaml       # Backend 서비스
        ├── frontend-deployment.yaml   # Frontend 배포
        ├── frontend-service.yaml      # Frontend 서비스
        ├── ingress.yaml              # Ingress 설정
        ├── hpa.yaml                  # 수평 확장 설정
        └── pdb.yaml                  # Pod 중단 예산
```

## 🛠️ 기술 스택

- **Kubernetes** 1.30+ - 컨테이너 오케스트레이션
- **Helm** v3 - 패키지 관리자
- **Nginx Ingress** - 로드 밸런서
- **HPA** - 수평 자동 확장
- **PDB** - Pod 중단 예산

## 🚀 배포 가이드

### 요구사항
- Kubernetes 클러스터 (1.30+)
- Helm v3
- kubectl 설정 완료
- Container Registry 접근 권한

### 1. 기본 배포

```bash
# Helm 차트로 배포
helm install image-converter ./infra/helm-chart

# 특정 네임스페이스에 배포
helm install image-converter ./infra/helm-chart -n image-converter --create-namespace

# 배포 상태 확인
helm status image-converter
kubectl get pods -l app.kubernetes.io/name=image-converter
```

### 2. 커스텀 설정으로 배포

```bash
# 커스텀 values 파일 사용
helm install image-converter ./infra/helm-chart -f custom-values.yaml

# 명령행에서 값 오버라이드
helm install image-converter ./infra/helm-chart \
  --set global.imageRegistry=your-registry.com \
  --set ingress.hosts[0].host=your-domain.com \
  --set backend.replicaCount=3  # HPA disabled only
```

### 3. 업그레이드

```bash
# 차트 업그레이드
helm upgrade image-converter ./infra/helm-chart

# 롤백
helm rollback image-converter 1
```

## ⚙️ 설정 옵션

### Global 설정
```yaml
global:
  imageRegistry: harbor.example.com    # 컨테이너 레지스트리
  imagePullSecrets: []                # 이미지 풀 시크릿
```

### Backend 설정
```yaml
backend:
  image:
    repository: image-converter/backend
    tag: "0.1.0"
    pullPolicy: IfNotPresent
  
  replicaCount: 2                     # 복제본 수 (HPA 사용 시 무시됨)
  
  service:
    type: ClusterIP                   # 서비스 타입
    port: 8000                        # 서비스 포트
    targetPort: 8000                  # 컨테이너 포트
  
  resources:                          # 리소스 제한
    limits:
      cpu: 1500m                      # MutatingWebhook/LimitRange가 낮은 기본값(예: 200m)을 주입하면 변환이 매우 느려질 수 있음
      memory: 1Gi
    requests:
      cpu: 250m
      memory: 256Mi

  # 임시 파일 경로를 tmpfs(/tmp)로 마운트하여 libvips의 O_TMPFILE 사용을 보장
  # 및 임시 I/O 성능 향상. 메모리 사용량 증가에 주의.
  tmpfs:
    enabled: false                    # 프로덕션에서는 kkamji_values.yaml에서 true로 설정
    # medium: Memory                 # Memory=tmpfs, 미지정 시 노드 디스크(emptyDir 기본)
    # sizeLimit: 1Gi                  # 선택: tmpfs 용량 제한
  
  healthcheck:                        # 헬스체크 설정
    enabled: true
    path: /health
    initialDelaySeconds: 30
    periodSeconds: 10
```

### Frontend 설정
```yaml
frontend:
  image:
    repository: image-converter/frontend
    tag: "0.1.0"
    pullPolicy: IfNotPresent
  
  replicaCount: 2                     # HPA 사용 시 무시됨
  
  service:
    type: ClusterIP
    port: 80
    targetPort: 80
  
  resources:
    limits:
      cpu: 200m
      memory: 256Mi
    requests:
      cpu: 100m
      memory: 128Mi
```

### Ingress 설정
```yaml
ingress:
  enabled: true
  className: "nginx"                  # Ingress 클래스
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  
  hosts:
    - host: image-converter.example.com
      paths:
        - path: /                     # Frontend 경로
          pathType: Prefix
          service: frontend
        - path: /api                  # Backend API 경로
          pathType: Prefix
          service: backend
  
  tls:                               # TLS 설정
    - secretName: image-converter-tls
      hosts:
        - image-converter.example.com
```

### 자동 확장 설정
```yaml
autoscaling:
  backend:
    enabled: true
    minReplicas: 2                    # 최소 복제본
    maxReplicas: 10                   # 최대 복제본
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
  
  frontend:
    enabled: true
    minReplicas: 2
    maxReplicas: 5
    targetCPUUtilizationPercentage: 70
```

## 🔧 환경별 배포

### 개발 환경
```bash
# 개발용 설정으로 배포
helm install image-converter-dev ./infra/helm-chart \
  --set global.imageRegistry=localhost:5000 \
  --set ingress.hosts[0].host=dev.image-converter.local \
  --set backend.replicaCount=1 \  # 기본 복제본 수
  --set frontend.replicaCount=1
```

### 스테이징 환경
```bash
# 스테이징용 설정으로 배포
helm install image-converter-staging ./infra/helm-chart \
  --set global.imageRegistry=staging-registry.com \
  --set ingress.hosts[0].host=staging.image-converter.com \
  --set backend.replicaCount=2 \  # 기본 복제본 수
  --set frontend.replicaCount=2
```

### 프로덕션 환경
```bash
# 프로덕션용 설정으로 배포
helm install image-converter-prod ./infra/helm-chart \
  --set global.imageRegistry=prod-registry.com \
  --set ingress.hosts[0].host=image-converter.com \
  --set backend.replicaCount=3 \  # HPA가 비활성화된 경우에만 사용
  --set frontend.replicaCount=3 \  # HPA가 비활성화된 경우에만 사용
  --set autoscaling.backend.enabled=true \
  --set autoscaling.frontend.enabled=true
```

## 📊 모니터링 및 로깅

### 헬스체크
```bash
# Pod 상태 확인
kubectl get pods -l app.kubernetes.io/name=image-converter

# 서비스 상태 확인
kubectl get svc -l app.kubernetes.io/name=image-converter

# Ingress 상태 확인
kubectl get ingress -l app.kubernetes.io/name=image-converter
```

### 로그 확인
```bash
# Backend 로그
kubectl logs -l app.kubernetes.io/component=backend -f

# Frontend 로그
kubectl logs -l app.kubernetes.io/component=frontend -f

# 특정 Pod 로그
kubectl logs <pod-name> -f
```

### 메트릭 확인
```bash
# HPA 상태 확인
kubectl get hpa

# 리소스 사용량 확인
kubectl top pods -l app.kubernetes.io/name=image-converter
kubectl top nodes
```

## 🔒 보안 설정

### TLS 인증서 설정
```bash
# Let's Encrypt 인증서 (cert-manager 사용)
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: image-converter-tls
spec:
  secretName: image-converter-tls
  issuerRef:
    name: letsencrypt-prod
    kind: ClusterIssuer
  dnsNames:
  - image-converter.example.com
EOF
```

### 네트워크 정책
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: image-converter-netpol
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: image-converter
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8000
    - protocol: TCP
      port: 80
```

## 🚨 트러블슈팅

### 일반적인 문제

1. **Pod가 시작되지 않음**
   ```bash
   # Pod 상태 확인
   kubectl describe pod <pod-name>
   
   # 이벤트 확인
   kubectl get events --sort-by=.metadata.creationTimestamp
   ```

2. **이미지 풀 실패**
   ```bash
   # 이미지 풀 시크릿 확인
   kubectl get secrets
   
   # 레지스트리 접근 권한 확인
   kubectl create secret docker-registry regcred \
     --docker-server=<registry-url> \
     --docker-username=<username> \
     --docker-password=<password>
   ```

3. **Ingress 접근 불가**
   ```bash
   # Ingress 컨트롤러 상태 확인
   kubectl get pods -n ingress-nginx
   
   # DNS 설정 확인
   nslookup image-converter.example.com
   ```

4. **HPA 작동 안함**
   ```bash
   # Metrics Server 확인
   kubectl get pods -n kube-system | grep metrics-server
   
   # HPA 상태 확인
   kubectl describe hpa image-converter-backend
   ```
   - 주의: CPU 기반 HPA(Utilization)는 컨테이너에 cpu requests가 설정되어 있어야 작동합니다.
     backend의 requests/limits를 비워둔 경우 CPU 기준 자동확장은 비활성화됩니다.
     필요 시 Memory 기반(TargetAverageValue) 또는 커스텀 메트릭으로 전환하세요.

### 변환이 90초 이상 걸리거나 "요청 시간이 초과되었습니다"가 발생
- 원인: CPU limit가 낮게(예: 200m) 설정되거나, 기본 limit를 주입하는 MutatingWebhook/LimitRange 존재.
- 해결 절차:
  1. `kkamji_values.yaml`에서 backend/frontend `resources.limits`를 요청값 이상으로 명시(backend: 1500m/1Gi, frontend: 500m/512Mi 권장).
  2. 변경 후 ArgoCD Sync 또는 `kubectl rollout restart deployment/image-converter-backend` 실행.
  3. FastAPI 로그(`Conversion complete ... in X.XXs`)를 확인하여 처리 시간이 90초 이하로 회복됐는지 검증.
  4. 여전히 느리면 이미지 크기 제한(`MAX_IMAGE_PIXELS`) 또는 리소스 증설을 고려.

### "O_TMPFILE failed!" 로그가 보임
- 원인: 컨테이너 루트 FS/overlayfs가 O_TMPFILE을 지원하지 않음. libvips가 일반 파일 열기로 폴백.
- 해결: backend Pod에 `/tmp` emptyDir를 마운트하고 `TMPDIR=/tmp`, `VIPS_TMPDIR=/tmp`를 지정.
  - Memory 기반(tmpfs)을 쓰면 속도는 빠르지만 일부 환경에서 여전히 O_TMPFILE을 지원하지 않을 수 있습니다. 필요 시 emptyDir를 노드 디스크로 사용해도 안전합니다.
  - INFO 로그가 노이즈일 경우 `pyvips` 로거 레벨을 WARNING으로 낮춰 억제합니다(기본 설정 반영).
  - values 예시(kkamji_values.yaml 적용됨):
    ```yaml
    backend:
      tmpfs:
        enabled: true
        medium: null
      env:
        - name: TMPDIR
          value: "/tmp"
        - name: VIPS_TMPDIR
          value: "/tmp"
    ```

### 디버깅 명령어
```bash
# 전체 리소스 상태 확인
kubectl get all -l app.kubernetes.io/name=image-converter

# 특정 Pod 내부 접근
kubectl exec -it <pod-name> -- /bin/bash

# 포트 포워딩으로 로컬 테스트
kubectl port-forward svc/image-converter-backend 8000:8000
kubectl port-forward svc/image-converter-frontend 3000:80
```

## 🔄 CI/CD 통합

### GitHub Actions 배포
```yaml
- name: Deploy to Kubernetes
  run: |
    helm upgrade --install image-converter ./infra/helm-chart \
      --set global.imageRegistry=${{ env.REGISTRY }} \
      --set backend.image.tag=${{ github.sha }} \
      --set frontend.image.tag=${{ github.sha }} \
      --wait --timeout=300s
```

### ArgoCD 배포
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: image-converter
spec:
  source:
    repoURL: https://github.com/KKamJi98/image-converter
    path: infra/helm-chart
    targetRevision: main
    helm:
      valueFiles:
        - kkamji_values.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: image-converter
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

참고: 환경별 오버라이드를 사용하지 않으면 기본 `values.yaml`의 리소스 제한(예: frontend CPU limit 200m)이 적용됩니다. ArgoCD에서 `helm.valueFiles`로 `kkamji_values.yaml`을 포함해 환경 전용 설정을 반영하세요.

## 📈 성능 튜닝

### 리소스 최적화
- CPU/메모리 요청/제한 값 조정
- HPA 임계값 튜닝
- PDB 설정으로 가용성 보장

### 네트워크 최적화
- Ingress 캐싱 설정
- CDN 연동
- 압축 설정

## 🤝 기여하기

1. Helm 차트 수정 시 `helm lint` 실행
2. 새로운 환경 추가 시 values 파일 분리
3. 보안 설정 변경 시 문서 업데이트
4. 성능 테스트 결과 공유

## 📞 지원

- **인프라 문의**: `rlaxowl5460@gmail.com`
- **이슈 리포트**: [GitHub Issues](https://github.com/KKamJi98/image-converter/issues)
- **Helm 차트**: [Artifact Hub](https://artifacthub.io/)
