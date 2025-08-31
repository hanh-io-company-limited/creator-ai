# 🚀 Creator AI Edge Extension - Hướng dẫn cài đặt chi tiết

## 📋 Yêu cầu trước khi cài đặt

### 1. Kiểm tra phiên bản Edge
- Mở Microsoft Edge
- Vào `Settings` → `About Microsoft Edge`
- Đảm bảo phiên bản **88.0 trở lên**

### 2. Cài đặt Creator AI Desktop
Trước khi sử dụng extension, bạn cần:

1. **Tải và cài đặt Creator AI Desktop** từ repository chính
2. **Khởi động ứng dụng** để server local chạy
3. **Kiểm tra server** đang chạy tại `http://localhost:3001`

### 3. Tải mã nguồn extension
```bash
# Clone repository
git clone https://github.com/hanh-io-company-limited/creator-ai.git

# Vào thư mục extension
cd creator-ai/edge-extension
```

## 🔧 Cài đặt Extension - Bước chi tiết

### Bước 1: Mở Edge Extensions Page
1. Mở Microsoft Edge
2. Gõ `edge://extensions/` vào thanh địa chỉ
3. Hoặc: Menu `...` → `Extensions`

### Bước 2: Bật Developer Mode
1. Tìm toggle **"Developer mode"** ở góc trái dưới
2. Bật chế độ này lên (switch sang màu xanh)
3. Các nút mới sẽ xuất hiện: "Load unpacked", "Pack extension", "Update"

### Bước 3: Load Extension
1. Nhấn nút **"Load unpacked"**
2. Duyệt và chọn thư mục `creator-ai/edge-extension`
3. Nhấn **"Select Folder"**

### Bước 4: Xác nhận cài đặt
Extension sẽ xuất hiện với:
- ✅ Tên: "Creator AI"
- ✅ Phiên bản: "1.0.0"
- ✅ Status: "Enabled"
- ✅ Icon: Logo AI xanh tím

### Bước 5: Pin Extension (khuyến nghị)
1. Nhấn vào icon puzzle piece (🧩) trên thanh công cụ
2. Tìm "Creator AI" trong danh sách
3. Nhấn vào icon pin để ghim vào thanh công cụ

## ✅ Kiểm tra cài đặt thành công

### 1. Kiểm tra icon
- Icon Creator AI xuất hiện trên thanh công cụ
- Icon có màu xanh tím với chữ "AI"

### 2. Kiểm tra popup
1. Nhấn vào icon Creator AI
2. Popup mở ra với 3 tab: "Tạo ảnh", "Animation", "Video"
3. Trạng thái kết nối hiển thị ở góc phải trên

### 3. Kiểm tra kết nối
- Khởi động Creator AI Desktop
- Mở popup extension
- Trạng thái hiển thị "Đã kết nối" (chấm xanh)

## 🛠️ Khắc phục lỗi cài đặt

### ❌ Lỗi: "Package is invalid"
**Nguyên nhân**: File manifest.json có lỗi
**Giải pháp**:
```bash
cd edge-extension
node validate.js
```

### ❌ Lỗi: "Could not load extension"
**Nguyên nhân**: Thiếu file hoặc permission không đúng
**Giải pháp**:
1. Kiểm tra tất cả file có đầy đủ không
2. Chạy script validation
3. Thử load lại extension

### ❌ Extension không hiển thị
**Nguyên nhân**: Developer mode chưa bật
**Giải pháp**:
1. Vào `edge://extensions/`
2. Bật "Developer mode"
3. Load lại extension

### ❌ Icon không hiển thị trên thanh công cụ
**Giải pháp**:
1. Vào `edge://extensions/`
2. Tìm Creator AI extension
3. Nhấn "Details"
4. Bật "Pin to toolbar"

## 🔄 Cập nhật Extension

### Khi có phiên bản mới:
1. Tải mã nguồn mới từ Git
2. Vào `edge://extensions/`
3. Tìm Creator AI extension
4. Nhấn icon "Reload" (🔄)

### Auto-reload khi development:
1. Vào `edge://extensions/`
2. Bật "Reload" cho extension
3. File thay đổi sẽ tự động reload

## 🧪 Test Extension

### Test cơ bản:
1. Mở popup extension
2. Kiểm tra 3 tab hiển thị đúng
3. Kiểm tra trạng thái kết nối

### Test tạo hình ảnh:
1. Tab "Tạo ảnh"
2. Nhập prompt: "Một con mèo dễ thương"
3. Nhấn "Tạo hình ảnh"
4. Kiểm tra kết quả

### Test upload file:
1. Tab "Animation"
2. Upload một file ảnh
3. Kiểm tra preview hiển thị
4. Nhấn "Tạo Animation"

## 📊 Thông tin Extension

```json
{
  "name": "Creator AI",
  "version": "1.0.0",
  "manifest_version": 3,
  "size": "~75KB",
  "permissions": ["activeTab", "storage", "background"],
  "host_permissions": ["http://localhost:*"]
}
```

## 🔐 Quyền và Bảo mật

### Quyền được yêu cầu:
- **activeTab**: Tương tác với tab hiện tại
- **storage**: Lưu cài đặt extension
- **background**: Chạy service worker

### Host permissions:
- **localhost**: Kết nối đến Creator AI server

### Dữ liệu được lưu trữ:
- Cài đặt extension (port, preferences)
- Lịch sử kết nối (không lưu nội dung)
- Log lỗi (để debug)

## 📞 Hỗ trợ cài đặt

### Nếu gặp vấn đề:
1. **Kiểm tra logs**: Mở popup → F12 → Console
2. **Chạy validation**: `node validate.js`
3. **Kiểm tra Creator AI Desktop** có chạy không
4. **Liên hệ hỗ trợ**: support@hanh-io.com

### Thông tin cần cung cấp khi báo lỗi:
- Phiên bản Edge
- Thông báo lỗi cụ thể
- Screenshots
- Console logs (F12)

---

**🎯 Sau khi cài đặt thành công, bạn có thể sử dụng Creator AI ngay từ trình duyệt Edge!**