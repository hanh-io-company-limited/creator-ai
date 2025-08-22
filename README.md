# Creator AI - Hệ thống Sao lưu OneDrive Tự động

Hệ thống khép kín để tự động sao lưu dữ liệu từ máy tính lên đám mây OneDrive với giao diện web quản lý.

## 🎯 Tính năng chính

### 1. Tự động sao lưu dữ liệu
- ✅ Giám sát thư mục tự động và đồng bộ hóa với OneDrive
- ✅ Sao lưu tức thì khi có tệp mới được thêm vào
- ✅ Đảm bảo dữ liệu luôn được lưu trữ an toàn trên đám mây

### 2. Giao diện web hiện đại
- ✅ Giao diện tiếng Việt thân thiện
- ✅ Tải lên tệp bằng kéo thả hoặc chọn tệp
- ✅ Xem danh sách tệp đã sao lưu
- ✅ Tải xuống tệp từ bản sao lưu
- ✅ Hiển thị trạng thái đồng bộ hóa real-time

### 3. Hệ thống khép kín
- ✅ Tích hợp Microsoft Graph API cho OneDrive
- ✅ Xác thực OAuth 2.0 an toàn
- ✅ Giám sát file system liên tục
- ✅ Đồng bộ hóa tự động và thủ công

### 4. Bảo mật
- ✅ Xác thực Microsoft OAuth 2.0
- ✅ Mã hóa dữ liệu trong quá trình truyền tải
- ✅ Kiểm soát truy cập an toàn

## 🚀 Cài đặt và Sử dụng

### Yêu cầu hệ thống
- Node.js 14+ 
- npm hoặc yarn
- Tài khoản Microsoft với OneDrive
- Ứng dụng Microsoft Azure (để lấy API credentials)

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình Microsoft Azure App

1. Truy cập [Azure Portal](https://portal.azure.com)
2. Tạo một App Registration mới
3. Cấu hình Redirect URI: `http://localhost:3000/auth/callback`
4. Cấp quyền Microsoft Graph API:
   - `User.Read`
   - `Files.ReadWrite.All`
5. Lấy Client ID và Client Secret

### 3. Cấu hình môi trường

Sao chép file cấu hình mẫu:
```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với thông tin của bạn:
```env
CLIENT_ID=your_microsoft_app_client_id
CLIENT_SECRET=your_microsoft_app_client_secret
TENANT_ID=common
REDIRECT_URI=http://localhost:3000/auth/callback

PORT=3000
BACKUP_FOLDER=./backup-data
UPLOAD_FOLDER=./uploads

SESSION_SECRET=your_secure_session_secret_here

ONEDRIVE_FOLDER_NAME=CreatorAI-Backup
SYNC_INTERVAL=30000
```

### 4. Khởi chạy hệ thống

#### Chạy server web:
```bash
npm start
```

#### Chạy dịch vụ backup tự động (terminal khác):
```bash
npm run backup
```

#### Chế độ phát triển:
```bash
npm run dev
```

### 5. Truy cập giao diện web

Mở trình duyệt và truy cập: `http://localhost:3000`

## 📁 Cấu trúc thư mục

```
creator-ai/
├── config/
│   └── config.js              # Cấu hình ứng dụng
├── public/
│   ├── css/
│   │   └── style.css          # Giao diện CSS
│   ├── js/
│   │   └── app.js             # JavaScript frontend
│   └── index.html             # Giao diện chính
├── backup-data/               # Thư mục sao lưu local
├── uploads/                   # Thư mục tạm cho uploads
├── server.js                  # Server web chính
├── backup-service.js          # Dịch vụ backup tự động
├── package.json              # Dependencies và scripts
├── .env.example              # Mẫu cấu hình môi trường
└── README.md                 # Tài liệu này
```

## 🔧 Cách sử dụng

### 1. Xác thực OneDrive
- Mở giao diện web tại `http://localhost:3000`
- Nhấn "Đăng nhập OneDrive"
- Đăng nhập với tài khoản Microsoft của bạn

### 2. Tải lên tệp
- Kéo thả tệp vào vùng upload
- Hoặc nhấn "Chọn Tệp" để browse tệp
- Tệp sẽ tự động được sao lưu lên OneDrive

### 3. Quản lý tệp
- Xem danh sách tệp đã sao lưu
- Tải xuống tệp khi cần
- Theo dõi trạng thái đồng bộ

### 4. Sao lưu tự động
- Dịch vụ backup sẽ tự động giám sát thư mục `backup-data`
- Mọi tệp mới sẽ được đồng bộ lên OneDrive ngay lập tức

## 🛠️ Scripts có sẵn

```bash
npm start        # Khởi chạy server web
npm run dev      # Chạy server với nodemon (auto-reload)
npm run backup   # Chạy dịch vụ backup tự động
```

## 🔒 Bảo mật

- Sử dụng OAuth 2.0 của Microsoft cho xác thực
- Dữ liệu được mã hóa trong quá trình truyền tải
- Access token được quản lý an toàn
- Không lưu trữ mật khẩu người dùng

## 🚨 Lưu ý quan trọng

1. **Bảo mật credentials**: Không commit file `.env` vào git
2. **Giới hạn file**: Giới hạn upload là 50MB mỗi file
3. **Network**: Cần kết nối internet để đồng bộ OneDrive
4. **Quyền truy cập**: Cần quyền đọc/ghi OneDrive

## 🆘 Khắc phục sự cố

### Lỗi xác thực
- Kiểm tra CLIENT_ID và CLIENT_SECRET trong `.env`
- Đảm bảo Redirect URI đúng trong Azure App
- Kiểm tra quyền API trong Azure Portal

### Lỗi đồng bộ
- Kiểm tra kết nối internet
- Đảm bảo có quyền truy cập OneDrive
- Kiểm tra log console để xem chi tiết lỗi

### Lỗi upload
- Kiểm tra dung lượng file (max 50MB)
- Đảm bảo có đủ dung lượng OneDrive
- Kiểm tra định dạng file có được hỗ trợ

## 📝 License

Apache License 2.0 - xem file [LICENSE](LICENSE) để biết chi tiết.

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo Issue hoặc Pull Request.

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo Issue trên GitHub hoặc liên hệ team phát triển.

---

**Creator AI Team** - Giải pháp sao lưu thông minh cho kỷ nguyên số