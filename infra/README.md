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
  --set backend.replicaCount=3
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
  
  replicaCount: 2                     # 복제본 수
  
  service:
    type: ClusterIP                   # 서비스 타입
    port: 8000                        # 서비스 포트
    targetPort: 8000                  # 컨테이너 포트
  
  resources:                          # 리소스 제한
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 250m
      memory: 256Mi
  
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
  
  replicaCount: 2
  
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
    nginx.ingress.kubernetes.io/rewrite-target: /
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
  --set backend.replicaCount=1 \
  --set frontend.replicaCount=1
```

### 스테이징 환경
```bash
# 스테이징용 설정으로 배포
helm install image-converter-staging ./infra/helm-chart \
  --set global.imageRegistry=staging-registry.com \
  --set ingress.hosts[0].host=staging.image-converter.com \
  --set backend.replicaCount=2 \
  --set frontend.replicaCount=2
```

### 프로덕션 환경
```bash
# 프로덕션용 설정으로 배포
helm install image-converter-prod ./infra/helm-chart \
  --set global.imageRegistry=prod-registry.com \
  --set ingress.hosts[0].host=image-converter.com \
  --set backend.replicaCount=3 \
  --set frontend.replicaCount=3 \
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
    repoURL: https://github.com/your-repo/image-convertor
    path: infra/helm-chart
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: image-converter
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

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

- **인프라 문의**: infra-team@example.com
- **이슈 리포트**: [GitHub Issues](https://github.com/your-repo/image-convertor/issues)
- **Helm 차트**: [Artifact Hub](https://artifacthub.io/)
