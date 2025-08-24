#!/bin/bash

# Production Deployment Script for Creator AI
# This script deploys the complete Creator AI system to production

set -e

# Configuration
DOMAIN="hanh-io-company-limitedorg.org"
SERVER_IP="150.95.109.182"
APP_DIR="/opt/creator-ai"
COMPOSE_FILE="docker-compose.prod.yml"

echo "🚀 Starting Creator AI Production Deployment..."
echo "📍 Domain: $DOMAIN"
echo "🖥️  Server IP: $SERVER_IP"
echo "📁 App Directory: $APP_DIR"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root for production deployment"
    exit 1
fi

# Create application directory
echo "📁 Creating application directories..."
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/uploads"
mkdir -p "$APP_DIR/models"
mkdir -p "$APP_DIR/logs/nginx"
mkdir -p "$APP_DIR/logs/backend"
mkdir -p "$APP_DIR/logs/ai-models"
mkdir -p "$APP_DIR/ssl/certs"
mkdir -p "$APP_DIR/ssl/private"

# Set directory permissions
chown -R root:root "$APP_DIR"
chmod -R 755 "$APP_DIR"
chmod 700 "$APP_DIR/ssl/private"

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "🔧 Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Copy application files to production directory
echo "📋 Copying application files..."
cp -r . "$APP_DIR/app"
cd "$APP_DIR/app"

# Create production environment file
cp .env.production .env

# Setup SSL certificates
echo "🔐 Setting up SSL certificates..."
if [ -f "./scripts/setup-ssl.sh" ]; then
    chmod +x ./scripts/setup-ssl.sh
    ./scripts/setup-ssl.sh
else
    echo "⚠️  SSL setup script not found. Please set up SSL certificates manually."
fi

# Build production images
echo "🏗️  Building production Docker images..."
docker-compose -f "$COMPOSE_FILE" build --no-cache

# Pull any additional required images
docker-compose -f "$COMPOSE_FILE" pull

# Start the application
echo "🚀 Starting Creator AI application..."
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🏥 Checking service health..."
for service in nginx backend ai-models; do
    echo "Checking $service..."
    if docker-compose -f "$COMPOSE_FILE" ps "$service" | grep -q "Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service is not running"
        docker-compose -f "$COMPOSE_FILE" logs "$service"
    fi
done

# Test endpoints
echo "🧪 Testing application endpoints..."

# Test HTTP redirect
if curl -s -o /dev/null -w "%{http_code}" "http://$DOMAIN" | grep -q "301"; then
    echo "✅ HTTP to HTTPS redirect working"
else
    echo "⚠️  HTTP to HTTPS redirect may not be working"
fi

# Test HTTPS
if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200"; then
    echo "✅ HTTPS frontend accessible"
else
    echo "⚠️  HTTPS frontend may not be accessible"
fi

# Test API health
if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/api/health" | grep -q "200"; then
    echo "✅ API health check passing"
else
    echo "⚠️  API health check may be failing"
fi

# Setup log rotation
echo "📋 Setting up log rotation..."
cat > /etc/logrotate.d/creator-ai << EOF
$APP_DIR/logs/*/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        docker exec creator-ai-nginx nginx -s reload > /dev/null 2>&1 || true
    endscript
}
EOF

# Setup monitoring script
cat > "$APP_DIR/monitor.sh" << EOF
#!/bin/bash
# Creator AI Monitoring Script

echo "🔍 Creator AI System Status - \$(date)"
echo "=================================="

# Check Docker containers
echo "📦 Container Status:"
docker-compose -f $APP_DIR/app/$COMPOSE_FILE ps

echo ""
echo "💾 Disk Usage:"
df -h "$APP_DIR"

echo ""
echo "🏥 Health Checks:"
curl -s "https://$DOMAIN/health" || echo "Frontend health check failed"
curl -s "https://$DOMAIN/api/health" || echo "API health check failed"

echo ""
echo "📊 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
EOF

chmod +x "$APP_DIR/monitor.sh"

# Setup daily monitoring cron job
if ! crontab -l 2>/dev/null | grep -q "monitor.sh"; then
    echo "⏰ Setting up monitoring cron job..."
    (crontab -l 2>/dev/null; echo "0 8 * * * $APP_DIR/monitor.sh >> $APP_DIR/logs/monitoring.log 2>&1") | crontab -
fi

# Setup backup script
cat > "$APP_DIR/backup.sh" << EOF
#!/bin/bash
# Creator AI Backup Script

BACKUP_DIR="$APP_DIR/backups/\$(date +%Y%m%d_%H%M%S)"
mkdir -p "\$BACKUP_DIR"

echo "💾 Creating backup in \$BACKUP_DIR..."

# Backup uploads
tar -czf "\$BACKUP_DIR/uploads.tar.gz" -C "$APP_DIR" uploads/

# Backup AI models
tar -czf "\$BACKUP_DIR/models.tar.gz" -C "$APP_DIR" models/

# Backup logs
tar -czf "\$BACKUP_DIR/logs.tar.gz" -C "$APP_DIR" logs/

# Backup configuration
cp "$APP_DIR/app/.env" "\$BACKUP_DIR/"
cp "$APP_DIR/app/$COMPOSE_FILE" "\$BACKUP_DIR/"

# Remove backups older than 30 days
find "$APP_DIR/backups" -type d -mtime +30 -exec rm -rf {} +

echo "✅ Backup completed: \$BACKUP_DIR"
EOF

chmod +x "$APP_DIR/backup.sh"

# Setup backup cron job
if ! crontab -l 2>/dev/null | grep -q "backup.sh"; then
    echo "⏰ Setting up backup cron job..."
    (crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/backup.sh >> $APP_DIR/logs/backup.log 2>&1") | crontab -
fi

# Create management commands
cat > "$APP_DIR/manage.sh" << EOF
#!/bin/bash
# Creator AI Management Script

case "\$1" in
    start)
        echo "🚀 Starting Creator AI..."
        cd "$APP_DIR/app"
        docker-compose -f "$COMPOSE_FILE" up -d
        ;;
    stop)
        echo "🛑 Stopping Creator AI..."
        cd "$APP_DIR/app"
        docker-compose -f "$COMPOSE_FILE" down
        ;;
    restart)
        echo "🔄 Restarting Creator AI..."
        cd "$APP_DIR/app"
        docker-compose -f "$COMPOSE_FILE" restart
        ;;
    status)
        echo "📊 Creator AI Status:"
        cd "$APP_DIR/app"
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    logs)
        echo "📋 Creator AI Logs:"
        cd "$APP_DIR/app"
        docker-compose -f "$COMPOSE_FILE" logs -f --tail=100 "\${2:-}"
        ;;
    update)
        echo "🔄 Updating Creator AI..."
        cd "$APP_DIR/app"
        git pull
        docker-compose -f "$COMPOSE_FILE" build --no-cache
        docker-compose -f "$COMPOSE_FILE" up -d
        ;;
    backup)
        echo "💾 Creating backup..."
        "$APP_DIR/backup.sh"
        ;;
    monitor)
        echo "🔍 System monitoring..."
        "$APP_DIR/monitor.sh"
        ;;
    *)
        echo "Usage: \$0 {start|stop|restart|status|logs|update|backup|monitor}"
        exit 1
        ;;
esac
EOF

chmod +x "$APP_DIR/manage.sh"

# Create systemd service
cat > /etc/systemd/system/creator-ai.service << EOF
[Unit]
Description=Creator AI Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR/app
ExecStart=/usr/local/bin/docker-compose -f $COMPOSE_FILE up -d
ExecStop=/usr/local/bin/docker-compose -f $COMPOSE_FILE down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable creator-ai.service

echo ""
echo "🎉 Creator AI Production Deployment Completed!"
echo "=================================="
echo "🌐 Domain: https://$DOMAIN"
echo "🖥️  Server IP: $SERVER_IP"
echo "📁 App Directory: $APP_DIR"
echo "🔧 Management: $APP_DIR/manage.sh"
echo "📊 Monitoring: $APP_DIR/monitor.sh"
echo "💾 Backup: $APP_DIR/backup.sh"
echo ""
echo "📝 Next Steps:"
echo "1. Verify DNS points to $SERVER_IP"
echo "2. Test SSL certificate: curl -I https://$DOMAIN"
echo "3. Monitor application: $APP_DIR/manage.sh status"
echo "4. View logs: $APP_DIR/manage.sh logs"
echo ""
echo "✅ Deployment completed successfully!"