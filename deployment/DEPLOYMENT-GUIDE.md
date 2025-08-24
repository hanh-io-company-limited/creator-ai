# Creator AI Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Creator AI system to production with Docker multi-stage builds, SSL/TLS encryption, and domain configuration.

## System Architecture

```
Internet → DNS (hanh-io-company-limitedorg.org) → Server (150.95.109.182)
    ↓
    Nginx (SSL Termination, Reverse Proxy)
    ↓
    ┌─────────────────┬─────────────────┬─────────────────┐
    │    Frontend     │     Backend     │   AI Models     │
    │   (React SPA)   │  (Node.js API)  │ (Python FastAPI)│
    │    Port: 80     │   Port: 3001    │   Port: 8000    │
    └─────────────────┴─────────────────┴─────────────────┘
```

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04 LTS or newer / CentOS 8+ / Amazon Linux 2
- **CPU**: Minimum 4 cores (8+ recommended for AI processing)
- **RAM**: Minimum 8GB (16GB+ recommended)
- **Storage**: Minimum 100GB SSD
- **Network**: Public IP address (150.95.109.182)

### Domain Requirements
- Domain: `hanh-io-company-limitedorg.org`
- DNS management access
- Email for SSL certificate generation

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Git
- curl/wget

## Pre-Deployment Checklist

- [ ] Server with IP 150.95.109.182 is accessible via SSH
- [ ] Domain `hanh-io-company-limitedorg.org` is registered
- [ ] DNS management access available
- [ ] Firewall ports 80, 443, and 22 are open
- [ ] Root or sudo access on the server

## Step 1: Server Preparation

### 1.1 Connect to Server
```bash
ssh root@150.95.109.182
# or with SSH key
ssh -i your-key.pem root@150.95.109.182
```

### 1.2 Update System
```bash
# Ubuntu/Debian
apt update && apt upgrade -y

# CentOS/RHEL
yum update -y

# Amazon Linux
yum update -y
```

### 1.3 Install Git
```bash
# Ubuntu/Debian
apt install -y git

# CentOS/RHEL/Amazon Linux
yum install -y git
```

## Step 2: DNS Configuration

Configure DNS records to point your domain to the server IP.

### 2.1 Required DNS Records
Add these records in your DNS management system:

```
Type: A
Name: hanh-io-company-limitedorg.org
Value: 150.95.109.182
TTL: 300

Type: A
Name: www.hanh-io-company-limitedorg.org
Value: 150.95.109.182
TTL: 300
```

### 2.2 Verify DNS Propagation
```bash
# Test DNS resolution
dig hanh-io-company-limitedorg.org A
nslookup hanh-io-company-limitedorg.org

# Expected result: 150.95.109.182
```

**Note**: DNS propagation can take 24-48 hours. Wait for propagation before proceeding.

## Step 3: Clone and Deploy Application

### 3.1 Clone Repository
```bash
cd /opt
git clone https://github.com/hanh-io-company-limited/creator-ai.git
cd creator-ai
```

### 3.2 Make Deployment Script Executable
```bash
chmod +x scripts/deploy-production.sh
chmod +x scripts/setup-ssl.sh
```

### 3.3 Run Production Deployment
```bash
./scripts/deploy-production.sh
```

This script will:
- Install Docker and Docker Compose
- Create application directories
- Set up SSL certificates with Let's Encrypt
- Build production Docker images
- Start all services
- Configure monitoring and backups
- Set up systemd service

## Step 4: Verify Deployment

### 4.1 Check Container Status
```bash
cd /opt/creator-ai/app
docker-compose -f docker-compose.prod.yml ps
```

Expected output:
```
Name                     State    Ports
creator-ai-nginx         Up       0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
creator-ai-backend       Up       3001/tcp
creator-ai-ai-models     Up       8000/tcp
```

### 4.2 Test Application Access
```bash
# Test HTTP redirect
curl -I http://hanh-io-company-limitedorg.org
# Expected: 301 redirect to HTTPS

# Test HTTPS frontend
curl -I https://hanh-io-company-limitedorg.org
# Expected: 200 OK

# Test API health
curl https://hanh-io-company-limitedorg.org/api/health
# Expected: {"status": "healthy", ...}
```

### 4.3 Check SSL Certificate
```bash
openssl s_client -connect hanh-io-company-limitedorg.org:443 -servername hanh-io-company-limitedorg.org
```

## Step 5: Application Management

### 5.1 Management Commands
Use the management script for common operations:

```bash
# Start application
/opt/creator-ai/manage.sh start

# Stop application
/opt/creator-ai/manage.sh stop

# Restart application
/opt/creator-ai/manage.sh restart

# Check status
/opt/creator-ai/manage.sh status

# View logs
/opt/creator-ai/manage.sh logs
/opt/creator-ai/manage.sh logs backend  # specific service

# Update application
/opt/creator-ai/manage.sh update

# Create backup
/opt/creator-ai/manage.sh backup

# System monitoring
/opt/creator-ai/manage.sh monitor
```

### 5.2 Systemd Service
The deployment creates a systemd service for automatic startup:

```bash
# Start service
systemctl start creator-ai

# Enable auto-start on boot
systemctl enable creator-ai

# Check service status
systemctl status creator-ai

# View service logs
journalctl -u creator-ai -f
```

## Step 6: Monitoring and Maintenance

### 6.1 Log Locations
```
/opt/creator-ai/logs/nginx/        - Nginx access and error logs
/opt/creator-ai/logs/backend/      - Backend application logs
/opt/creator-ai/logs/ai-models/    - AI models service logs
/opt/creator-ai/logs/monitoring.log - System monitoring log
/opt/creator-ai/logs/backup.log    - Backup operation log
```

### 6.2 Automated Tasks
The deployment sets up automated tasks:

- **SSL Renewal**: Every Sunday at 3 AM
- **System Monitoring**: Daily at 8 AM
- **Backups**: Daily at 2 AM
- **Log Rotation**: Daily

### 6.3 Manual Monitoring
```bash
# Check system resources
docker stats

# Check disk usage
df -h /opt/creator-ai

# Check application health
curl -s https://hanh-io-company-limitedorg.org/health
curl -s https://hanh-io-company-limitedorg.org/api/health

# View real-time logs
docker-compose -f /opt/creator-ai/app/docker-compose.prod.yml logs -f
```

## Step 7: Security Configuration

### 7.1 Firewall Setup (if not configured)
```bash
# Ubuntu/Debian (UFW)
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# CentOS/RHEL (firewalld)
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

### 7.2 SSL Security Headers
The nginx configuration includes security headers:
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Content-Security-Policy

### 7.3 Rate Limiting
Configured rate limits:
- API endpoints: 10 requests/second
- Upload endpoints: 5 requests/second

## Step 8: Performance Optimization

### 8.1 Docker Resource Limits
The AI models service has memory limits:
- Memory limit: 4GB
- Memory reservation: 2GB

### 8.2 Nginx Optimizations
- Gzip compression enabled
- Static asset caching (1 year)
- HTTP/2 enabled
- Connection keep-alive

### 8.3 Application Optimizations
- Multi-stage Docker builds for smaller images
- Production environment variables
- Optimized Node.js settings

## Troubleshooting

### Common Issues

#### 1. DNS Not Resolving
```bash
# Check DNS propagation
dig hanh-io-company-limitedorg.org A
# Wait for propagation or check DNS provider settings
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
/opt/creator-ai/ssl/verify-ssl.sh

# Regenerate certificate
./scripts/setup-ssl.sh
```

#### 3. Container Won't Start
```bash
# Check container logs
docker-compose -f /opt/creator-ai/app/docker-compose.prod.yml logs service-name

# Check disk space
df -h

# Check memory usage
free -h
```

#### 4. Application Not Accessible
```bash
# Check nginx status
docker exec creator-ai-nginx nginx -t

# Check backend health
docker exec creator-ai-backend curl localhost:3001/health

# Check network connectivity
curl -I http://localhost
```

### Log Analysis
```bash
# Check error logs
tail -f /opt/creator-ai/logs/nginx/error.log
tail -f /opt/creator-ai/logs/backend/app.log

# Search for specific errors
grep -i error /opt/creator-ai/logs/nginx/error.log
grep -i "failed\|error" /opt/creator-ai/logs/backend/app.log
```

## Backup and Recovery

### 8.1 Automated Backups
Daily backups include:
- User uploads
- AI model data
- Application logs
- Configuration files

Backup location: `/opt/creator-ai/backups/`

### 8.2 Manual Backup
```bash
# Create immediate backup
/opt/creator-ai/backup.sh

# Restore from backup
# (Extract backup files to appropriate directories)
```

### 8.3 Data Persistence
Important data is stored in Docker volumes:
- `uploads_data`: User uploaded files
- `ai_models_data`: AI model files
- Log directories: Application logs

## Scaling Considerations

### 8.1 Horizontal Scaling
For high traffic, consider:
- Load balancer in front of multiple instances
- Separate database server
- CDN for static assets
- Container orchestration (Kubernetes)

### 8.2 Vertical Scaling
- Increase server CPU/RAM
- Adjust Docker resource limits
- Optimize AI model processing

## Support and Maintenance

### 8.1 Updates
```bash
# Update application code
cd /opt/creator-ai/app
git pull
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### 8.2 Health Monitoring
Set up external monitoring:
- Uptime monitoring for https://hanh-io-company-limitedorg.org
- SSL certificate expiration monitoring
- Server resource monitoring

## Conclusion

The Creator AI system is now deployed and accessible at:
- **Main Application**: https://hanh-io-company-limitedorg.org
- **API Endpoint**: https://hanh-io-company-limitedorg.org/api

The deployment includes:
- ✅ Multi-stage Docker builds for optimization
- ✅ SSL/TLS encryption with automatic renewal
- ✅ Production-grade nginx configuration
- ✅ Health checks and monitoring
- ✅ Automated backups
- ✅ Log rotation
- ✅ Security headers and rate limiting
- ✅ Systemd service for reliability

For ongoing support, refer to the management scripts and monitoring logs.