# WebPetShop

Một website bán lẻ thú cưng (Pet Shop) đơn giản được xây dựng bằng HTML, CSS và JavaScript. Dự án này sử dụng `localStorage` của trình duyệt để lưu trữ và quản lý tất cả dữ liệu, bao gồm thông tin người dùng, sản phẩm, giỏ hàng và đơn hàng.

## Tính năng chính

### 1. Trang Người dùng (Client-Side)

* **Trang chủ:** Hiển thị các danh mục chính (Chó, Mèo, Thức ăn, Khác).
* **Trang sản phẩm:**
    * Liệt kê sản phẩm theo danh mục.
    * Tìm kiếm và lọc sản phẩm (theo tên, giá).
    * Xem chi tiết sản phẩm (qua một modal).
* **Xác thực người dùng:**
    * Đăng ký và đăng nhập tài khoản.
    * Xem thông tin cá nhân và lịch sử đơn hàng.
* **Giỏ hàng & Thanh toán:**
    * Thêm/xóa sản phẩm vào giỏ hàng.
    * Cập nhật số lượng sản phẩm.
    * Tiến hành thanh toán và tạo đơn hàng.

### 2. Trang Quản trị (Admin Panel)

* **Đăng nhập Admin:** Trang đăng nhập riêng cho quản trị viên (mặc định: `admin` / `123456`).
* **Dashboard:** Bảng điều khiển thống kê tổng quan (doanh thu, số lượng người dùng, sản phẩm, đơn hàng).
* **Quản lý Người dùng:** Thêm, sửa, xóa, và khóa/mở khóa tài khoản người dùng.
* **Quản lý Sản phẩm & Danh mục:** Quản lý CRUD (Tạo, Đọc, Cập nhật, Xóa) cho sản phẩm và các danh mục.
* **Quản lý Đơn hàng:** Xem và cập nhật trạng thái các đơn hàng của khách.
* **Quản lý Tồn kho:** Xem số lượng tồn kho và tạo phiếu nhập hàng để cập nhật số lượng.
* **Thống kê:** Xem báo cáo doanh thu và các sản phẩm bán chạy.

## Công nghệ sử dụng

* **HTML5**
* **CSS3** (cho giao diện)
* **JavaScript (ES6+)** (cho toàn bộ logic)
* **LocalStorage** (dùng thay thế cho cơ sở dữ liệu)

## Cách chạy dự án

1.  Clone hoặc tải về toàn bộ thư mục dự án.
2.  Mở file `index.html` trong trình duyệt để xem trang người dùng.
3.  Mở file `admin.html` trong trình duyệt để truy cập trang quản trị.