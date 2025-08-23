# Creator AI - Deployment Guide

## Hướng dẫn triển khai lên hanh-io-company-limitedorg.org

### 1. Chuẩn bị server

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cài đặt PM2 để quản lý process
sudo npm install -g pm2

# Cài đặt Nginx
sudo apt install nginx -y

# Cài đặt Certbot cho SSL
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 2. Clone và cài đặt project

```bash
# Clone repository
git clone https://github.com/hanh-io-company-limited/creator-ai.git
cd creator-ai

# Cài đặt dependencies
npm run install:all

# Build frontend
npm run build
```

### 3. Cấu hình environment

```bash
# Sao chép và chỉnh sửa environment file
cp .env.example .env
nano .env
```

Cập nhật các thông tin trong `.env`:
```env
NODE_ENV=production
DOMAIN=hanh-io-company-limitedorg.org
PORT=3000

# Tạo JWT secret mạnh
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Cấu hình OpenAI API (nếu có)
OPENAI_API_KEY=your-openai-api-key

# Cấu hình allowed origins
ALLOWED_ORIGINS=https://hanh-io-company-limitedorg.org
```

### 4. Cấu hình Nginx

```bash
# Sao chép cấu hình Nginx
sudo cp config/nginx.conf /etc/nginx/sites-available/creator-ai
sudo ln -s /etc/nginx/sites-available/creator-ai /etc/nginx/sites-enabled/

# Kiểm tra cấu hình
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 5. Cấu hình SSL với Let's Encrypt

```bash
# Tạo SSL certificate
sudo certbot --nginx -d hanh-io-company-limitedorg.org

# Kiểm tra auto-renewal
sudo certbot renew --dry-run
```

### 6. Khởi chạy ứng dụng với PM2

```bash
# Tạo PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'creator-ai',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Tạo thư mục logs
mkdir -p logs

# Khởi chạy với PM2
pm2 start ecosystem.config.js

# Lưu PM2 configuration
pm2 save

# Tạo startup script
pm2 startup
```

### 7. Cài đặt AI Models (Tùy chọn)

#### Stable Diffusion (Local)
```bash
# Cài đặt Python và dependencies
sudo apt install python3 python3-pip python3-venv -y

# Clone AUTOMATIC1111 WebUI
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui

# Tạo service cho Stable Diffusion
sudo tee /etc/systemd/system/stable-diffusion.service > /dev/null <<EOF
[Unit]
Description=Stable Diffusion WebUI
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/stable-diffusion-webui
ExecStart=/path/to/stable-diffusion-webui/webui.sh --api --listen --port 7860
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable stable-diffusion
sudo systemctl start stable-diffusion
```

#### Whisper (Local)
```bash
# Cài đặt whisper.cpp
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
make

# Download model
./models/download-ggml-model.sh base

# Chạy server
./server -m models/ggml-base.bin --port 8080
```

### 8. Monitoring và Logging

```bash
# Xem logs ứng dụng
pm2 logs creator-ai

# Monitor system
pm2 monit

# Xem Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 9. Backup và Bảo trì

#### Daily backup script
```bash
#!/bin/bash
# /home/deploy/backup.sh

DATE=$(date +%Y-%m-%d)
BACKUP_DIR="/home/deploy/backups"
PROJECT_DIR="/home/deploy/creator-ai"

mkdir -p $BACKUP_DIR

# Backup uploads và data
tar -czf $BACKUP_DIR/creator-ai-data-$DATE.tar.gz $PROJECT_DIR/uploads $PROJECT_DIR/data

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

#### Crontab cho auto backup
```bash
# Thêm vào crontab
crontab -e

# Backup hàng ngày lúc 2:00 AM
0 2 * * * /home/deploy/backup.sh
```

### 10. Security Checklist

- [ ] Firewall được cấu hình (chỉ mở port 80, 443, 22)
- [ ] SSH key authentication (disable password login)
- [ ] Regular security updates
- [ ] SSL certificate auto-renewal
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] CORS properly configured
- [ ] Environment variables secured

### 11. Performance Optimization

```bash
# Tối ưu Nginx
sudo nano /etc/nginx/nginx.conf

# Thêm vào http block:
gzip on;
gzip_vary on;
gzip_min_length 1024;
client_max_body_size 100M;

# Tối ưu PM2
pm2 set pm2:autodump true
pm2 set pm2:watch-ignore node_modules
```

### 12. Troubleshooting

#### Kiểm tra services
```bash
# Kiểm tra PM2
pm2 status

# Kiểm tra Nginx
sudo systemctl status nginx

# Kiểm tra SSL
openssl s_client -connect hanh-io-company-limitedorg.org:443

# Kiểm tra DNS
dig hanh-io-company-limitedorg.org
```

#### Common issues
1. **502 Bad Gateway**: Kiểm tra PM2 app có đang chạy không
2. **SSL issues**: Kiểm tra certificate và cấu hình Nginx
3. **Performance issues**: Monitor với `pm2 monit` và `htop`

### 13. Updates và Maintenance

```bash
# Script update ứng dụng
#!/bin/bash
cd /home/deploy/creator-ai

# Backup current version
git stash

# Pull latest changes
git pull origin main

# Install new dependencies
npm install
cd client && npm install && cd ..

# Build new frontend
npm run build

# Restart application
pm2 restart creator-ai

echo "Deployment completed!"
```