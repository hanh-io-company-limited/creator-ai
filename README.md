# Creator AI - Secure Standalone HTML System

## 📋 Tổng quan

Tệp `index.html` này là một hệ thống Creator AI hoàn chỉnh, bảo mật, và hoạt động độc lập. Tệp chứa toàn bộ nội dung từ pull request #8 và có thể được mở trực tiếp từ trình duyệt mà không cần server hoặc dependencies bên ngoài.

## 🔐 Thông tin đăng nhập

**Email:** `hanhlehangelcosmetic@gmail.com`  
**Mật khẩu:** `Kimhanh99@`

> **Lưu ý bảo mật:** Thông tin đăng nhập được mã hóa cứng an toàn trong JavaScript và sử dụng session management qua Local Storage.

## 🚀 Cách sử dụng

### Phương pháp 1: Mở trực tiếp
1. Tải tệp `index.html` về máy tính
2. Nhấp đúp vào tệp hoặc kéo thả vào trình duyệt
3. Nhập thông tin đăng nhập ở trên
4. Bắt đầu sử dụng hệ thống Creator AI

### Phương pháp 2: Qua HTTP Server (tùy chọn)
```bash
# Chạy server đơn giản
python3 -m http.server 8000

# Mở trình duyệt và truy cập
http://localhost:8000
```

## 🎨 Tính năng chính

### 📸 Avatar từ Ảnh
1. **Tải lên ảnh cận cảnh** (tối đa 10 ảnh JPG/PNG)
2. **Đào tạo Model AI** - Phân tích đặc điểm khuôn mặt
3. **Tạo Avatar mới** - Sử dụng lời nhắc văn bản, tạo 4 avatar
4. **Thêm chuyển động** - Chuyển đổi thành video 5-10 giây
5. **Nâng cấp chất lượng** - Upscale lên 4K
6. **Tạo Video 1080p** - Đồng bộ âm thanh hoặc text-to-speech

### 🎥 Avatar từ Video  
1. **Tải lên video ngắn** (3-5 giây MP4/MOV/AVI)
2. **Xử lý AI** - Tạo avatar từ video
3. **Tạo nội dung** - Đồng bộ âm thanh hoặc kịch bản văn bản

## 🛡️ Tính năng bảo mật

- ✅ Thông tin đăng nhập được hardcode an toàn
- ✅ Session management qua Local Storage
- ✅ Input validation và error handling
- ✅ Không có dependencies bên ngoài
- ✅ Hoạt động hoàn toàn offline

## 📱 Responsive Design

- 💻 **Desktop**: Giao diện đầy đủ với sidebar navigation
- 📱 **Tablet**: Layout được điều chỉnh phù hợp
- 📱 **Mobile**: Stack layout với touch-friendly controls

## 🎯 Workflow hướng dẫn

### Bước 1: Đăng nhập
- Nhập email: `hanhlehangelcosmetic@gmail.com`
- Nhập mật khẩu: `Kimhanh99@`
- Nhấn "Đăng nhập"

### Bước 2: Chọn chế độ
- **📸 Avatar từ Ảnh**: Tạo avatar từ photos
- **🎥 Avatar từ Video**: Tạo avatar từ video clips

### Bước 3: Theo dõi workflow
- Hoàn thành từng bước theo thứ tự
- Chờ progress indicators hoàn thành
- Kiểm tra kết quả sau mỗi bước

### Bước 4: Tải xuống
- Sử dụng nút "📥 Tải xuống Video" khi hoàn thành

## 📊 Thông số kỹ thuật

- **Kích thước tệp**: 41KB (tất cả CSS, JS embedded)
- **Ngôn ngữ**: Vietnamese interface
- **Browser support**: Chrome, Firefox, Safari, Edge (modern browsers)
- **Dependencies**: Không có (hoàn toàn standalone)

## 🔧 Tùy chỉnh

Tệp HTML có thể được tùy chỉnh bằng cách:
1. Sửa đổi CSS trong thẻ `<style>`
2. Cập nhật JavaScript trong thẻ `<script>`
3. Thay đổi credentials trong `VALID_CREDENTIALS`

## 🐛 Troubleshooting

### Lỗi đăng nhập
- Kiểm tra email: `hanhlehangelcosmetic@gmail.com`
- Kiểm tra mật khẩu: `Kimhanh99@` (chú ý chữ hoa và ký tự đặc biệt)

### Lỗi giao diện
- Đảm bảo JavaScript được enable trong trình duyệt
- Thử refresh page (F5)
- Xóa Local Storage: `localStorage.clear()` trong Console

### Lỗi file upload
- Kiểm tra định dạng file (JPG/PNG cho ảnh, MP4/MOV/AVI cho video)
- Đảm bảo kích thước file không quá lớn

## 📞 Hỗ trợ

Tệp này chứa đầy đủ functionality từ PR #8 và được thiết kế để hoạt động độc lập. Nếu gặp vấn đề, hãy kiểm tra:

1. Console của trình duyệt (F12) để xem lỗi JavaScript
2. Network tab để kiểm tra resource loading
3. Local Storage để xác minh session data

---

**Creator AI** - Bringing AI Avatar Creation to the Next Level 🚀