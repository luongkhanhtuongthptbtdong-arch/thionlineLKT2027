HỆ THỐNG PHỤC VỤ DẠY HỌC
Tác giả: Lương Khánh Tường — ĐT/Zalo: 0916780807

CẤU TRÚC DỰ ÁN
  index.html          Khung giao diện, nạp CSS và các module
  css/app.css         Bố cục, thành phần giao diện
  css/theme.css       Bảng màu, hiệu ứng
  js/app.js           Lõi hệ thống: tài khoản, lớp, ngân hàng, đề, ma trận, đồng bộ
  js/theory.js        Sinh lý thuyết đầy đủ kèm hình vẽ cho từng bài
  js/import.js        Nhập nguyên đề từ PDF, Word, LaTeX ex_test, văn bản dán
  data/               Nơi đặt các gói học liệu tĩnh (data.json, data-<mon>-<khoi>.json)
  firebase-config.json (tự tạo trong app) Cấu hình máy chủ cho đăng nhập Gmail

TRIỂN KHAI
1. Tải toàn bộ thư mục lên hosting tĩnh: Cloudflare Pages, Netlify, GitHub Pages
   hoặc Firebase Hosting. Giữ nguyên cấu trúc thư mục.
   - GitHub Pages: Add file > Upload files, kéo cả thư mục vào, Commit,
     rồi Settings > Pages > Branch main / root.
2. Vào địa chỉ trang, mở đăng nhập quản trị bằng liên kết "Quản trị hệ thống"
   ở cuối màn hình đăng nhập (hoặc thêm #admin vào cuối địa chỉ).
   Mật khẩu lần đầu: LKT@2026 — đổi ngay trong Người dùng & hệ thống.
3. Muốn giáo viên đăng nhập bằng Gmail: tạo dự án Firebase miễn phí,
   bật Authentication > Google và Firestore, rồi dán cấu hình vào app
   (Người dùng & hệ thống > Dán cấu hình Firebase). App tạo tệp
   firebase-config.json, tải tệp đó lên cùng thư mục index.html.
4. Sinh ngân hàng câu hỏi (Sinh ngân hàng theo chương – bài – dạng),
   tạo bài học (Bài học > Tạo bài học tự động), rồi vào
   Triển khai & quy mô > Tải tất cả tệp để xuất data.json và các tệp môn,
   đặt vào cùng thư mục index.html (hoặc thư mục data/ nếu sửa DATA_URL).

GHI CHÚ KĨ THUẬT
- Công thức toán viết theo LaTeX giữa hai dấu $, hiển thị bằng MathJax.
  Từ Word: MathType > Preferences > Cut and Copy Preferences > LaTeX rồi copy sang.
- Nhập PDF đọc lớp văn bản của tệp; PDF bản scan cần nhận dạng chữ trước.
- Nhập LaTeX theo gói ex_test: nhận \begin{ex}, \choice, \choiceTF, \shortans, \loigiai.
- Ngân hàng câu hỏi lưu bằng IndexedDB nên chứa được hàng chục nghìn câu.
