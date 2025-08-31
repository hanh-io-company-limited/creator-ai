# Creator AI - Edge Extension

![Creator AI Extension](icons/icon128.png)

Extension Edge chính thức cho nền tảng Creator AI - Tạo nội dung AI ngay từ trình duyệt của bạn!

## 🌟 Tính năng

- **🎨 Tạo hình ảnh từ văn bản**: Sử dụng AI để tạo ra hình ảnh đẹp và chi tiết từ mô tả văn bản
- **🎬 Tạo Animation**: Chuyển đổi hình ảnh tĩnh thành animation sống động với nhiều hiệu ứng
- **🎥 Tạo Video**: Tạo video chuyên nghiệp với âm thanh và hiệu ứng AI
- **📁 Upload và quản lý file**: Dễ dàng upload và quản lý các file media
- **🔄 Real-time Progress**: Theo dõi tiến độ xử lý AI trong thời gian thực
- **💾 Tải xuống kết quả**: Lưu trữ và chia sẻ các tác phẩm đã tạo

## 📋 Yêu cầu hệ thống

- **Microsoft Edge** phiên bản 88 trở lên (hỗ trợ Manifest V3)
- **Creator AI Desktop Application** đã được cài đặt và đang chạy trên máy tính
- **Kết nối localhost**: Extension cần kết nối đến server Creator AI local (thường là port 3001)

## 🚀 Hướng dẫn cài đặt

### Bước 1: Tải mã nguồn
```bash
# Clone repository về máy
git clone https://github.com/hanh-io-company-limited/creator-ai.git
cd creator-ai/edge-extension
```

### Bước 2: Cài đặt extension trên Edge

1. **Mở Microsoft Edge**

2. **Truy cập trang Extensions**
   - Nhấn `Ctrl + Shift + X` hoặc
   - Vào menu `...` → `Extensions`

3. **Bật Developer Mode**
   - Tìm nút "Developer mode" ở góc trái dưới
   - Bật chế độ này lên (toggle switch)

4. **Load extension**
   - Nhấn nút "Load unpacked"
   - Chọn thư mục `edge-extension` trong project Creator AI
   - Extension sẽ được cài đặt và hiển thị trong danh sách

5. **Pin extension** (tùy chọn)
   - Nhấn vào biểu tượng puzzle piece trong thanh công cụ
   - Tìm "Creator AI" và nhấn vào biểu tượng pin

### Bước 3: Khởi động Creator AI Desktop
- Đảm bảo ứng dụng Creator AI Desktop đã được cài đặt
- Khởi động ứng dụng (server sẽ chạy ở localhost:3001)
- Extension sẽ tự động kết nối khi phát hiện server

## 🎯 Hướng dẫn sử dụng

### Kết nối với Creator AI
1. Nhấn vào biểu tượng Creator AI trên thanh công cụ
2. Kiểm tra trạng thái kết nối ở góc phải trên popup
3. Nếu hiển thị "Đã kết nối" (chấm xanh) → Sẵn sàng sử dụng
4. Nếu hiển thị "Không thể kết nối" → Khởi động Creator AI Desktop

### Tạo hình ảnh từ văn bản
1. Chọn tab "Tạo ảnh"
2. Nhập mô tả hình ảnh trong ô văn bản
3. Chọn phong cách và độ phân giải
4. Nhấn "Tạo hình ảnh"
5. Chờ AI xử lý và xem kết quả
6. Tải xuống hoặc tạo lại nếu cần

### Tạo Animation
1. Chọn tab "Animation"
2. Upload hình ảnh từ máy tính
3. Chọn loại animation mong muốn:
   - Đồng bộ môi (Lip sync)
   - Chuyển động đầu
   - Chớp mắt
   - Biểu cảm khuôn mặt
4. Nhấn "Tạo Animation"
5. Theo dõi tiến độ và xem kết quả

### Tạo Video
1. Chọn tab "Video"
2. Chọn nguồn video (từ ảnh đã upload hoặc animation đã tạo)
3. Chọn giọng nói (Tiếng Việt hoặc English)
4. Nhập văn bản cần đọc
5. Nhấn "Tạo Video"
6. Chờ xử lý và tải xuống kết quả

## 🛠️ Khắc phục sự cố

### Extension không kết nối được
**Nguyên nhân**: Creator AI Desktop chưa chạy hoặc chạy trên port khác
**Giải pháp**:
1. Khởi động Creator AI Desktop
2. Kiểm tra ứng dụng có chạy ở port 3001 không
3. Thử refresh extension popup

### Không thể upload file
**Nguyên nhân**: File quá lớn hoặc định dạng không hỗ trợ
**Giải pháp**:
1. Kiểm tra file có phải định dạng JPG, PNG, WEBP không
2. Đảm bảo file nhỏ hơn 10MB
3. Thử upload lại

### Lỗi tạo nội dung
**Nguyên nhân**: Server quá tải hoặc lỗi xử lý AI
**Giải pháp**:
1. Chờ một lúc và thử lại
2. Restart Creator AI Desktop
3. Kiểm tra logs trong Console (F12)

## 🔧 Cấu hình nâng cao

### Thay đổi port kết nối
Nếu Creator AI chạy trên port khác 3001:
1. Mở Developer Tools (F12)
2. Vào Console tab
3. Chạy: `window.creatorAPI.baseURL = 'http://localhost:YOUR_PORT/api'`

### Bật chế độ debug
1. Mở popup extension
2. Nhấn F12 để mở DevTools
3. Xem logs chi tiết trong Console

## 📚 API Documentation

Extension sử dụng các endpoint sau của Creator AI:

```
GET  /api/health              - Kiểm tra trạng thái server
POST /api/upload              - Upload file
POST /api/generation/create   - Tạo hình ảnh
GET  /api/generation/styles   - Lấy danh sách phong cách
POST /api/animation/create    - Tạo animation
GET  /api/animation/status/:id - Trạng thái animation
POST /api/video/create        - Tạo video
GET  /api/video/status/:id    - Trạng thái video
GET  /api/video/voices        - Danh sách giọng nói
```

## 🔒 Bảo mật và Quyền riêng tư

- **Xử lý offline**: Tất cả dữ liệu được xử lý trên máy tính của bạn
- **Không thu thập dữ liệu**: Extension không gửi dữ liệu về server bên ngoài
- **Kết nối an toàn**: Chỉ kết nối đến localhost (máy tính của bạn)
- **Quyền tối thiểu**: Extension chỉ yêu cầu quyền cần thiết

### Quyền được yêu cầu:
- `activeTab`: Để tương tác với tab hiện tại
- `storage`: Lưu trữ cài đặt extension
- `host_permissions`: Kết nối đến localhost Creator AI server

## 🤝 Đóng góp

Chúng tôi hoan nghênh mọi đóng góp! Để đóng góp:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 Giấy phép

Dự án này thuộc sở hữu của **Hanh IO Company Limited** và được bảo vệ bởi luật sở hữu trí tuệ.

```
Creator AI - Multi-Chain NFT Platform with AI Content Generation
Copyright (C) 2024 Hanh IO Company Limited. All Rights Reserved.

PROPRIETARY AND CONFIDENTIAL
```

## 🆘 Hỗ trợ

### Báo lỗi và yêu cầu tính năng
- 🐛 **GitHub Issues**: [Creator AI Issues](https://github.com/hanh-io-company-limited/creator-ai/issues)
- 💡 **Discussions**: [GitHub Discussions](https://github.com/hanh-io-company-limited/creator-ai/discussions)

### Liên hệ
- 📧 **Email hỗ trợ**: support@hanh-io.com
- 🌐 **Website**: [hanh-io.com](https://hanh-io.com)
- ⚖️ **Pháp lý**: legal@hanh-io.com

## 📋 Changelog

### v1.0.0 (2024-08-31)
- 🎉 Phiên bản đầu tiên
- ✨ Tạo hình ảnh từ văn bản
- 🎬 Tạo animation từ hình ảnh
- 🎥 Tạo video với âm thanh AI
- 🔄 Kết nối real-time với Creator AI Desktop
- 🎨 Giao diện Material Design hiện đại
- 🇻🇳 Hỗ trợ tiếng Việt đầy đủ

## 🚧 Lộ trình phát triển

### v1.1.0 (Sắp ra mắt)
- [ ] Batch processing - xử lý nhiều file cùng lúc
- [ ] Templates và presets
- [ ] Tích hợp blockchain/NFT minting
- [ ] Chia sẻ trực tiếp lên mạng xã hội
- [ ] Cải thiện hiệu suất

### v1.2.0 (Tương lai)
- [ ] Extension cho Chrome và Firefox
- [ ] Chế độ dark mode
- [ ] Keyboard shortcuts
- [ ] Workspace management
- [ ] Collaboration features

---

**🎨 Creator AI Extension - Sáng tạo không giới hạn với AI!**

*Được phát triển với ❤️ bởi Hanh IO Company Limited*