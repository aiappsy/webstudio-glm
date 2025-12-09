# Kubernetes Deployment for AiAppsy Web Studio

This directory contains Kubernetes manifests for deploying AiAppsy Web Studio to a Kubernetes cluster.

## 📋 Files

- `deployment.yaml` - Main application deployment
- `service.yaml` - Service configuration
- `ingress.yaml` - Ingress configuration with TLS
- `network-policy.yaml` - Network security policies
- `pvc.yaml` - Persistent volume claims for database

## 🚀 Quick Start

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -l app=aiappsy-web-studio

# Get service URL
kubectl get ingress aiappsy-web-studio-ingress
```

## 🔧 Configuration

### Environment Variables
Set up secrets before deploying:

```bash
# Create secrets
kubectl create secret generic aiappsy-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=nextauth-secret="your-secret" \
  --from-literal=openrouter-api-key="your-api-key"
```

### Customization
Modify the manifests as needed for your environment:
- Adjust resource limits and requests
- Configure storage classes
- Set up monitoring and logging
- Configure autoscaling parameters

## 🔍 Monitoring

### Health Checks
- Liveness probes on `/api/health`
- Readiness probes for startup verification
- Proper timeout and retry configurations

### Logging
- Structured logging with correlation IDs
- Log aggregation with fluentd or similar
- Error tracking and alerting

## 🔒 Security

### Network Policies
- Restrict pod-to-pod communication
- Control ingress and egress traffic
- Implement proper RBAC rules

### TLS Configuration
- Automatic certificate management with cert-manager
- Secure ingress configuration
- Proper certificate renewal

## 📈 Scaling

### Horizontal Pod Autoscaler
- CPU and memory based scaling
- Configurable min/max replicas
- Target utilization thresholds
- Proper metric collection

### Resource Management
- Appropriate resource requests and limits
- Memory and CPU optimization
- Storage class selection

## 🔄 Updates

### Rolling Updates
- Zero-downtime deployments
- Proper pod termination handling
- Graceful shutdown procedures
- Health check integration

### Rollback
- Automatic rollback on failure
- Version history tracking
- Manual rollback procedures

## 🌐 Multi-tenancy

### Database Isolation
- Separate database per deployment
- Connection pooling configuration
- Backup and restore procedures
- Migration management

### User Data
- Secure secret management
- Proper data encryption
- Access control and auditing
- GDPR compliance considerations

## 📊 Troubleshooting

### Common Issues
- Pod pending states
- Resource constraints
- Network connectivity
- DNS resolution problems

### Debug Commands
```bash
# Check pod logs
kubectl logs -l app=aiappsy-web-studio

# Describe pod issues
kubectl describe pod <pod-name>

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp

# Port-forward for debugging
kubectl port-forward service/aiappsy-web-studio-service 3000:3000
```

## 📚 Documentation

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Cert Manager](https://cert-manager.io/)
- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/cluster-administration/)