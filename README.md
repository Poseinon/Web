# TECHZONE - NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ LINH KIỆN MÁY TÍNH & PC GAMING

> Website thương mại điện tử chuyên nghiệp chuyên bán CPU, VGA/GPU, Mainboard, RAM, SSD, Nguồn PSU, Vỏ Case, Tản nhiệt và phụ kiện PC đỉnh cao, tích hợp công cụ kiểm tra độ tương thích **PC Builder** thời gian thực.

---

## 🚀 I. CÔNG NGHỆ SỬ DỤNG

### 1. Frontend
- **React.js 19** & **TypeScript**
- **Vite 8** (Build tool siêu tốc)
- **Tailwind CSS v4** (Dark Technology & Glassmorphism UI)
- **Lucide React** (Bộ icon công nghệ hiện đại)
- **Canvas-Confetti** (Hiệu ứng chúc mừng đặt hàng thành công)
- **Context API** (Quản lý trạng thái: Auth, Cart, Wishlist, Compare, Theme, Toast)

### 2. Backend & Database
- **Node.js** & **Express.js** (RESTful API Architecture)
- **TypeScript** & **tsx**
- **Prisma ORM** (Schema định nghĩa chuẩn cho MySQL)
- **In-Memory & JSON Engine** (`data/db.json` tự động seed và đồng bộ tức thì, không cần cài MySQL vẫn trải nghiệm 100% chức năng)
- **Bcrypt.js** (Mã hóa mật khẩu chuẩn an toàn)
- **JSON Web Token (JWT)** (Xác thực đăng nhập & phân quyền USER / ADMIN)

---

## 🔑 II. TÀI KHOẢN MẪU (DEMO ACCOUNTS)

Hệ thống đã được nạp sẵn 2 tài khoản mẫu (đã mã hóa bcrypt) và nút bấm điền nhanh trong form:

| Loại tài khoản | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@techzone.vn` | `Admin@123` | Toàn quyền Dashboard, CRUD sản phẩm, cập nhật trạng thái đơn hàng |
| **Khách hàng (User)** | `user@techzone.vn` | `User@123` | Đặt hàng, theo dõi đơn, wishlist, đánh giá linh kiện |

---

## 🛠 III. HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Yêu cầu môi trường
- **Node.js**: Phiên bản 18.0.0 trở lên
- **npm**: Phiên bản 9.0.0 trở lên

### 2. Cài đặt thư viện
```bash
# Cài đặt tất cả các gói dependencies
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env` từ `.env.example`:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=techzone-secret-key-super-secure-2026
DATABASE_URL="mysql://root:password@localhost:3306/techzone"
```

### 4. Thiết lập Database (Nếu dùng MySQL với Prisma)
```bash
# Sinh Prisma Client
npx prisma generate

# Chạy Migration tạo bảng
npx prisma migrate dev --name init

# Nạp dữ liệu mẫu vào MySQL
npx prisma db seed
```
> *Lưu ý*: Ứng dụng đã tích hợp sẵn cơ chế lưu trữ JSON tự động (`data/db.json`) nên ngay cả khi bạn chưa cài MySQL, toàn bộ các chức năng Thêm vào giỏ, Đặt hàng, Đăng ký, Đăng nhập, Tạo linh kiện Admin, Đánh giá đều hoạt động trơn tru 100%!

### 5. Khởi chạy ứng dụng
```bash
npm run dev
```
Truy cập trình duyệt tại: `http://localhost:3000`

---

## 🌟 IV. CÁC TÍNH NĂNG NỔI BẬT

### 1. Công Cụ Xây Dựng Cấu Hình PC (PC Builder)
- Cho phép người dùng chọn từng linh kiện: CPU, Mainboard, RAM, VGA, SSD, Nguồn PSU, Case, Tản nhiệt.
- **Thuật toán kiểm tra tương thích phần cứng**:
  - Socket CPU ↔ Socket Bo mạch chủ (ví dụ: AM5 khớp AM5, báo lỗi nếu chọn chip Intel LGA1700 cắm main AMD AM5).
  - Chuẩn RAM ↔ Khe cắm Bo mạch chủ (DDR5 vs DDR4).
  - Tự động cộng tổng công suất TDP các linh kiện và đối chiếu với công suất nguồn PSU để đưa ra khuyến nghị an toàn.
- Nút **"Thêm toàn bộ vào giỏ hàng"** chỉ với 1 click.

### 2. Tìm Kiếm Thông Minh (Smart Search & Autocomplete)
- Tìm kiếm realtime theo tên, SKU, hãng sản xuất.
- Bảng gợi ý sản phẩm xổ xuống kèm ảnh, giá và thương hiệu.
- Lưu lịch sử tìm kiếm gần đây trong `localStorage`.

### 3. Bộ Lọc Linh Kiện Đa Tầng (Faceted Filters)
- Lọc theo danh mục: CPU, VGA, Mainboard, RAM, SSD, Nguồn, Màn hình, Gear, Cáp.
- Lọc theo thương hiệu: ASUS ROG, MSI, Intel, AMD, Gigabyte, Corsair, Kingston, Samsung, Razer, Logitech.
- Lọc theo khoảng giá, socket CPU, chuẩn RAM, tình trạng còn hàng.

### 4. Giỏ Hàng & Mã Giảm Giá
- Hỗ trợ các mã coupon thực tế:
  - `TECHZONE10`: Giảm 10% tối đa 1.000.000₫ cho đơn từ 2.000.000₫.
  - `GAMINGPC`: Giảm 500.000₫ cho đơn từ 15.000.000₫.
  - `FREESHIP`: Miễn phí vận chuyển 30.000₫.
- Tự động tính phí ship (miễn phí với đơn hàng từ 10.000.000₫ trở lên).

### 5. Đặt Hàng & Thanh Toán Đa Dạng
- Thanh toán khi nhận hàng (COD).
- **Chuyển khoản VietQR 24/7**: Tự động sinh mã đơn hàng, hiển thị mã QR kèm số tài khoản và cú pháp chuyển tiền tiện lợi.
- Bắn hiệu ứng pháo hoa Confetti và trang chi tiết đơn hàng thành công.

### 6. So Sánh Sản Phẩm (Product Comparison)
- So sánh tối đa 4 linh kiện cạnh nhau: Giá, Socket, RAM, VRAM, TDP, Đánh giá.
- Nổi bật các điểm khác biệt về thông số kỹ thuật.

### 7. Bảng Điều Khiển Quản Trị (Admin Dashboard)
- Thống kê doanh thu thực tế, số lượng đơn hàng, linh kiện trong kho, khách hàng.
- Biểu đồ cột SVG trực quan về biến thiên doanh thu 6 tháng.
- Quản lý sản phẩm (CRUD): Thêm mới, chỉnh sửa thông số, điều chỉnh giá và số lượng tồn kho.
- Quản lý trạng thái đơn hàng: `PENDING` → `CONFIRMED` → `SHIPPING` → `DELIVERED` → `CANCELLED`.
- Danh sách khách hàng và thành viên hệ thống.

---

## 🎨 V. HỆ THỐNG MÀU SẮC & GIAO DIỆN
- **Background**: `#0B0F14` (Dark Tech)
- **Card Background**: `#111827`
- **Border**: `#1F2937`
- **Primary Accent**: `#00E5FF` (Cyan Neon)
- **Secondary Accent**: `#7C3AED` (Violet Purple)
- **Text Main**: `#F9FAFB`
- **Chế độ**: Mặc định Dark Mode, hỗ trợ chuyển Light Mode tức thì.
