# Creator AI - Deployment Guide

## Overview

Creator AI is a self-contained AI system designed for music content creators. This guide covers various deployment options from local development to production cloud infrastructure.

## System Requirements

### Minimum Requirements
- **CPU**: 4 cores (Intel i5 or AMD Ryzen 5 equivalent)
- **RAM**: 8 GB
- **Storage**: 50 GB free space (SSD recommended)
- **OS**: Linux (Ubuntu 20.04+), macOS 10.15+, Windows 10+
- **Node.js**: 18.0.0 or later
- **Docker**: 20.10+ (for containerized deployment)

### Recommended Requirements
- **CPU**: 8+ cores with AVX2 support
- **RAM**: 16+ GB
- **Storage**: 200+ GB SSD
- **GPU**: NVIDIA GPU with 8+ GB VRAM (optional, for acceleration)
- **Network**: Stable internet for initial setup

## Deployment Options

### 1. Local Development Setup

#### Quick Start

```bash
# Clone the repository
git clone https://github.com/hanh-io-company-limited/creator-ai.git
cd creator-ai

# Install dependencies
npm install

# Run tests
npm test

# Start the API server
npm run api

# In another terminal, start the desktop app
npm start
```

#### Manual Setup

1. **Install Node.js and npm**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # macOS (using Homebrew)
   brew install node
   
   # Windows (using Chocolatey)
   choco install nodejs
   ```

2. **Clone and setup the project**
   ```bash
   git clone https://github.com/hanh-io-company-limited/creator-ai.git
   cd creator-ai
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the system**
   ```bash
   # Create necessary directories
   mkdir -p models training_data output uploads logs
   
   # Initialize ML engine
   npm run api &
   curl -X POST http://localhost:3000/api/ml/initialize
   ```

#### Automated Local Deployment

```bash
# Use the automated deployment script
node scripts/deploy-local.js

# With custom configuration
node scripts/deploy-local.js --port 8080 --data-dir /opt/creator-ai --environment production

# Create systemd service (Linux)
node scripts/deploy-local.js --systemd
sudo cp /tmp/creator-ai.service /etc/systemd/system/
sudo systemctl enable creator-ai
sudo systemctl start creator-ai
```

### 2. Docker Deployment

#### Single Container

```bash
# Build the image
docker build -f docker/Dockerfile -t creator-ai:latest .

# Run the container
docker run -d \
  --name creator-ai \
  -p 3000:3000 \
  -v creator-ai-data:/app/models \
  -v creator-ai-output:/app/output \
  creator-ai:latest
```

#### Docker Compose (Recommended)

```bash
# Start all services
cd docker
docker-compose up -d

# View logs
docker-compose logs -f

# Scale API servers
docker-compose up -d --scale creator-ai-api=3

# Stop all services
docker-compose down
```

#### Docker Compose Configuration

```yaml
# docker/docker-compose.yml
version: '3.8'
services:
  creator-ai-api:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - models:/app/models
      - data:/app/training_data
      - output:/app/output
    environment:
      - NODE_ENV=production
    restart: unless-stopped

volumes:
  models:
  data:
  output:
```

### 3. Kubernetes Deployment

#### Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl configured
- Persistent volume provisioner
- Load balancer (for external access)

#### Quick Deployment

```bash
# Apply all Kubernetes manifests
kubectl apply -f docker/k8s-deployment.yaml

# Check deployment status
kubectl get pods,services,pvc

# Get external IP
kubectl get service creator-ai-api-service
```

#### Detailed Kubernetes Setup

1. **Create namespace**
   ```bash
   kubectl create namespace creator-ai
   kubectl config set-context --current --namespace=creator-ai
   ```

2. **Setup persistent volumes**
   ```bash
   # Ensure you have storage classes available
   kubectl get storageclass
   
   # Apply PVC manifests
   kubectl apply -f docker/k8s-deployment.yaml
   ```

3. **Deploy the application**
   ```bash
   # Build and push image to registry
   docker build -f docker/Dockerfile -t your-registry/creator-ai:latest .
   docker push your-registry/creator-ai:latest
   
   # Update image in k8s-deployment.yaml
   # Then apply
   kubectl apply -f docker/k8s-deployment.yaml
   ```

4. **Configure ingress (optional)**
   ```bash
   # Install nginx ingress controller
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
   
   # Apply ingress configuration
   kubectl apply -f docker/k8s-deployment.yaml
   ```

5. **Setup monitoring**
   ```bash
   # Install Prometheus
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm install prometheus prometheus-community/kube-prometheus-stack
   
   # Access Grafana
   kubectl port-forward svc/prometheus-grafana 3000:80
   ```

### 4. Cloud Platform Deployment

#### AWS ECS

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name creator-ai-cluster

# Create task definition
aws ecs register-task-definition --cli-input-json file://aws-task-definition.json

# Create service
aws ecs create-service \
  --cluster creator-ai-cluster \
  --service-name creator-ai-service \
  --task-definition creator-ai-task \
  --desired-count 2
```

#### Google Cloud Run

```bash
# Build and push to Google Container Registry
docker build -f docker/Dockerfile -t gcr.io/your-project/creator-ai:latest .
docker push gcr.io/your-project/creator-ai:latest

# Deploy to Cloud Run
gcloud run deploy creator-ai \
  --image gcr.io/your-project/creator-ai:latest \
  --platform managed \
  --region us-central1 \
  --memory 8Gi \
  --cpu 4 \
  --max-instances 10
```

#### Azure Container Instances

```bash
# Create resource group
az group create --name creator-ai-rg --location eastus

# Deploy container
az container create \
  --resource-group creator-ai-rg \
  --name creator-ai \
  --image your-registry/creator-ai:latest \
  --cpu 4 \
  --memory 8 \
  --ports 3000 \
  --dns-name-label creator-ai-unique
```

## Production Configuration

### Environment Variables

```bash
# Required
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Optional
DATA_DIR=/app/data
LOG_LEVEL=info
TFJS_BACKEND=cpu
MAX_MODEL_SIZE=2GB
MAX_TRAINING_TIME=3600
SESSION_SECRET=your-secret-key

# GPU Support (if available)
CUDA_VISIBLE_DEVICES=0
TF_FORCE_GPU_ALLOW_GROWTH=true
```

### Performance Tuning

#### Memory Management

```javascript
// In production, configure Node.js memory limits
node --max-old-space-size=8192 src/api/server.js

// Or use environment variable
export NODE_OPTIONS="--max-old-space-size=8192"
```

#### CPU Optimization

```bash
# Enable all CPU cores for TensorFlow.js
export TF_NUM_INTRAOP_THREADS=0
export TF_NUM_INTEROP_THREADS=0

# For specific thread counts
export TF_NUM_INTRAOP_THREADS=8
export TF_NUM_INTEROP_THREADS=4
```

#### Storage Optimization

```bash
# Use SSD for models and temporary data
# Mount fast storage for:
# - /app/models (model files)
# - /app/training_data (training datasets)
# - /tmp (temporary processing files)

# Example mount commands
sudo mount -t ext4 /dev/nvme0n1 /app/models
sudo mount -t ext4 /dev/nvme0n2 /app/training_data
```

### Security Configuration

#### Network Security

```bash
# Use reverse proxy (nginx example)
server {
    listen 80;
    server_name api.creator-ai.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name api.creator-ai.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### API Security

```javascript
// Add to API server configuration
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

## Monitoring and Logging

### Health Checks

```bash
# API health check
curl -f http://localhost:3000/health

# Detailed system info
curl http://localhost:3000/api/system/info
```

### Logging Configuration

```javascript
// Use structured logging in production
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### Metrics Collection

```bash
# Add Prometheus metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

## Backup and Recovery

### Model Backup

```bash
#!/bin/bash
# backup-models.sh

BACKUP_DIR="/backups/creator-ai/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

# Backup models
tar -czf "$BACKUP_DIR/models.tar.gz" -C /app/models .

# Backup training data
tar -czf "$BACKUP_DIR/training_data.tar.gz" -C /app/training_data .

# Backup configuration
cp /app/.env "$BACKUP_DIR/"

echo "Backup completed: $BACKUP_DIR"
```

### Database Backup (if using external DB)

```bash
# MongoDB backup
mongodump --host localhost:27017 --db creator-ai --out /backups/mongodb/

# PostgreSQL backup
pg_dump creator_ai > /backups/postgresql/creator_ai_$(date +%Y%m%d).sql
```

## Troubleshooting

### Common Issues

1. **Out of Memory Errors**
   ```bash
   # Increase Node.js heap size
   export NODE_OPTIONS="--max-old-space-size=16384"
   
   # Monitor memory usage
   docker stats
   kubectl top pods
   ```

2. **Model Loading Failures**
   ```bash
   # Check model file permissions
   ls -la /app/models/
   
   # Verify model file integrity
   file /app/models/*/model.json
   ```

3. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   lsof -i :3000
   
   # Use different port
   PORT=8080 npm run api
   ```

4. **TensorFlow.js Issues**
   ```bash
   # Check backend availability
   node -e "const tf = require('@tensorflow/tfjs'); console.log(tf.getBackend());"
   
   # Force CPU backend
   export TFJS_BACKEND=cpu
   ```

### Log Analysis

```bash
# Check API logs
docker logs creator-ai-api

# Follow logs in real-time
docker logs -f creator-ai-api

# Kubernetes logs
kubectl logs -f deployment/creator-ai-api
```

### Performance Debugging

```bash
# Node.js profiling
node --prof src/api/server.js
node --prof-process isolate-*.log > processed.txt

# Memory leak detection
node --inspect src/api/server.js
# Then use Chrome DevTools
```

## Scaling

### Horizontal Scaling

```bash
# Docker Compose
docker-compose up -d --scale creator-ai-api=5

# Kubernetes
kubectl scale deployment creator-ai-api --replicas=5

# Load balancer configuration (nginx)
upstream creator_ai_backend {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}
```

### Vertical Scaling

```bash
# Increase container resources
docker run -m 16g --cpus="8" creator-ai:latest

# Kubernetes resource limits
resources:
  limits:
    memory: "16Gi"
    cpu: "8"
  requests:
    memory: "8Gi"
    cpu: "4"
```

## Maintenance

### Regular Maintenance Tasks

```bash
#!/bin/bash
# maintenance.sh

# Clean up old logs
find /app/logs -name "*.log" -mtime +30 -delete

# Clean up temporary files
find /tmp -name "creator-ai-*" -mtime +1 -delete

# Backup models
./backup-models.sh

# Update system packages
apt update && apt upgrade -y

# Restart services
docker-compose restart
```

### Version Updates

```bash
# Update to new version
git pull origin main
npm install
npm test

# Build new Docker image
docker build -t creator-ai:new-version .

# Rolling update in Kubernetes
kubectl set image deployment/creator-ai-api creator-ai-api=creator-ai:new-version
kubectl rollout status deployment/creator-ai-api
```

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Review logs for error messages
3. Verify system requirements are met
4. Check GitHub issues for known problems
5. Contact support with detailed error information

## Security Considerations

- Use HTTPS in production environments
- Implement proper authentication and authorization
- Regularly update dependencies
- Use secrets management for sensitive configuration
- Enable audit logging
- Implement network security groups/firewalls
- Regular security scans and updates