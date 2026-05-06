# CocoCarbon MRV

Hệ thống Đo lường, Báo cáo và Xác minh (MRV) tín chỉ Carbon cho vườn dừa Việt Nam.

## 🚀 Chạy local

```bash
npm install
npm run dev
```

## 📦 Build & Deploy

```bash
npm run build
```

Deploy lên Vercel:
1. Push code lên GitHub
2. Import repo vào Vercel
3. Vercel tự detect Vite → deploy

## 🔐 Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Nông hộ | farmer@coconut.vn | password123 |
| Kiểm định viên | verifier@verra.vn | password123 |

## 🛠 Tech Stack

- React 19 + Vite 6
- Tailwind CSS v4
- Recharts
- Lucide React Icons
- React Router DOM v7

## 📋 Tính năng

### Nông hộ (Farmer)
- Dashboard tổng quan vườn dừa
- Nhập dữ liệu: độ ẩm/pH đất, nhiên liệu, vôi, phân bón
- Lịch sử đo lường với biểu đồ
- Tạo & gửi báo cáo carbon
- Đề xuất canh tác thông minh

### Kiểm định viên (Verifier)
- Tổng quan tất cả vườn dừa
- Kiểm định & phê duyệt báo cáo
- Xuất PDF báo cáo
- Cảnh báo dữ liệu bất thường
