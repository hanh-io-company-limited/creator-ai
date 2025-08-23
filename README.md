# Creator AI - Hệ thống AI Sáng tạo Độc lập

## Tổng quan

Creator AI là một hệ thống AI sáng tạo độc lập được thiết kế để chạy trên máy chủ riêng của người dùng. Hệ thống tích hợp các mô hình AI mã nguồn mở tiên tiến nhất như GPT, Stable Diffusion, và Whisper để cung cấp khả năng xử lý văn bản, tạo hình ảnh, và nhận diện giọng nói.

## Tính năng chính

### 🤖 AI Models Integration
- **GPT**: Tạo văn bản, chat AI, hỗ trợ sáng tạo nội dung
- **Stable Diffusion**: Tạo hình ảnh nghệ thuật từ mô tả văn bản
- **Whisper**: Nhận diện giọng nói và chuyển đổi thành văn bản

### 🎨 Giao diện người dùng
- Thiết kế nghệ thuật độc đáo với phong cách hiện đại
- Responsive design hỗ trợ mọi thiết bị
- Animations mượt mà với Framer Motion
- Theme màu gradient tối ưu cho trải nghiệm thị giác

### 🔒 Bảo mật
- Authentication với JWT tokens
- Rate limiting để bảo vệ khỏi spam
- Helmet.js cho security headers
- Input validation và sanitization
- CORS configuration

### ⚡ Hiệu suất
- File upload với compression tự động
- Caching strategies
- Lazy loading components
- Optimized bundle size với Vite

## Cài đặt và triển khai

### Yêu cầu hệ thống
- Node.js 18+ 
- RAM: Tối thiểu 8GB, khuyến nghị 16GB+
- Storage: Tối thiểu 50GB cho AI models
- GPU: Khuyến nghị có GPU NVIDIA để tăng tốc Stable Diffusion

### Cài đặt dependencies

```bash
# Cài đặt dependencies cho toàn bộ project
npm run install:all

# Hoặc cài đặt riêng lẻ
npm install
cd client && npm install
```

### Cấu hình environment

1. Sao chép file cấu hình mẫu:
```bash
cp .env.example .env
```

2. Điền thông tin cấu hình trong file `.env`:
```env
# Cấu hình server
PORT=3000
NODE_ENV=production
DOMAIN=hanh-io-company-limitedorg.org

# Cấu hình bảo mật
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-here

# API Keys cho AI Models
OPENAI_API_KEY=your-openai-api-key
STABLE_DIFFUSION_API_URL=http://localhost:7860
WHISPER_API_URL=http://localhost:8080
```

### Khởi chạy hệ thống

#### Development mode
```bash
# Terminal 1: Backend server
npm run dev

# Terminal 2: Frontend development server  
cd client && npm run dev
```

#### Production mode
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## Cấu hình AI Models

### OpenAI GPT
1. Đăng ký tài khoản tại [OpenAI](https://openai.com)
2. Tạo API key và thêm vào file `.env`
3. Cấu hình model trong `OPENAI_MODEL` (mặc định: gpt-3.5-turbo)

### Stable Diffusion (Local)
1. Cài đặt [AUTOMATIC1111 WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
2. Khởi chạy với API mode: `--api --listen`
3. Cấu hình URL trong `STABLE_DIFFUSION_API_URL`

### Whisper (Local hoặc OpenAI)
1. **Local**: Cài đặt [whisper.cpp](https://github.com/ggerganov/whisper.cpp)
2. **OpenAI**: Sử dụng chung API key với GPT

## Triển khai trên domain

### Cấu hình Nginx
```nginx
server {
    listen 80;
    server_name hanh-io-company-limitedorg.org;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL với Let's Encrypt
```bash
sudo certbot --nginx -d hanh-io-company-limitedorg.org
```

### Docker Deployment (Tùy chọn)
```dockerfile
# Dockerfile sẽ được tạo trong phiên bản tiếp theo
```

## Cấu trúc project

```
creator-ai/
├── server/                 # Backend API server
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── middleware/        # Express middleware
│   └── utils/            # Utility functions
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── styles/       # Styled components
│   │   └── utils/        # Frontend utilities
│   └── public/           # Static assets
├── config/               # Configuration files
├── docs/                 # Documentation
└── uploads/             # User uploaded files
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PATCH /api/auth/preferences` - Cập nhật preferences

### AI Services
- `POST /api/ai/text/generate` - Tạo văn bản với GPT
- `POST /api/ai/text/chat` - Chat với AI assistant
- `POST /api/ai/image/generate` - Tạo hình ảnh với Stable Diffusion
- `POST /api/ai/speech/transcribe` - Nhận diện giọng nói với Whisper
- `POST /api/ai/speech/synthesize` - Text to speech
- `GET /api/ai/models/status` - Kiểm tra trạng thái AI models

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `GET /api/upload/files` - Lấy danh sách files
- `GET /api/upload/file/:filename` - Download file
- `DELETE /api/upload/file/:filename` - Xóa file

## Bảo mật và tối ưu hóa

### Security Best Practices
- Sử dụng HTTPS trong production
- Cấu hình CORS hạn chế
- Rate limiting cho API endpoints
- Input validation và sanitization
- Secure headers với Helmet.js
- JWT token rotation
- File upload restrictions

### Performance Optimization
- Image optimization với Sharp
- File compression
- Caching strategies
- CDN cho static assets
- Database indexing (khi sử dụng database)
- Memory management cho AI models

## Monitoring và Logging
- Health check endpoint: `GET /api/health`
- Error logging với structured logs
- Performance monitoring
- AI model usage tracking
- User activity analytics

## Hỗ trợ và đóng góp

### Báo lỗi
Nếu bạn gặp vấn đề, vui lòng tạo issue trên GitHub với thông tin:
- Phiên bản hệ thống
- Mô tả chi tiết lỗi
- Steps to reproduce
- Log files (nếu có)

### Đóng góp
Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng:
1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Submit pull request

## Giấy phép
Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)

## Liên hệ
- Website: https://hanh-io-company-limitedorg.org
- Email: support@hanh-io-company-limitedorg.org