# Creator AI - Hệ thống tạo Avatar và Video AI

Creator AI là một hệ thống tích hợp AI mạnh mẽ để tạo ra avatar cá nhân và video chất lượng cao từ hình ảnh và lời nhắc văn bản.

## Tính năng chính

### 1. Tải lên hình ảnh và huấn luyện mô hình
- Giao diện tải hình ảnh cho phép người dùng tải lên 10 bức hình
- Tích hợp AI để xử lý và đào tạo mô hình diện mạo cá nhân

### 2. Tạo diện mạo bằng lời nhắc
- Tích hợp AI (Stable Diffusion/DALL-E) để tạo hình ảnh đẹp và chi tiết từ lời nhắc

### 3. Chuyển hình thành mô hình động
- Tích hợp AI (Wav2Lip) để biến hình ảnh thành mô hình động

### 4. Nâng cấp mô hình động thành hình ảnh 4K
- Sử dụng AI nâng cấp hình ảnh để tạo hình ảnh chất lượng cao

### 5. Tạo video từ mô hình 4K
- Tích hợp AI để đồng bộ môi miệng với giọng nói hoặc âm nhạc và tạo video

## Cấu trúc dự án

```
creator-ai/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express API server
├── ai-models/         # Python scripts for AI model integration
├── docs/              # Documentation
└── docker/            # Docker configuration
```

## Công nghệ sử dụng

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Node.js, Express, TypeScript
- **AI Models**: Python, TensorFlow/PyTorch
- **Database**: MongoDB/PostgreSQL
- **File Storage**: Local/Cloud storage
- **Containerization**: Docker

## Cài đặt và chạy

### Yêu cầu hệ thống
- Node.js 18+
- Python 3.9+
- Docker (optional)

### Cài đặt
```bash
# Clone repository
git clone https://github.com/hanh-io-company-limited/creator-ai.git
cd creator-ai

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install

# Install AI model dependencies
cd ../ai-models
pip install -r requirements.txt
```

### Chạy ứng dụng
```bash
# Start backend server
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm start

# Start AI model service (in another terminal)
cd ai-models
python main.py
```

## API Documentation

Xem tài liệu API tại: `/docs/api.md`

## Giấy phép

Dự án này được cấp phép theo Apache License 2.0. Xem file `LICENSE` để biết thêm chi tiết.