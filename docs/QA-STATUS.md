# Trạng thái kiểm tra — 28/10/2026

## Đã đạt
- Dữ liệu: 197 ID liên tiếp, 985 ví dụ Anh–Việt, 5 ví dụ/bài, 8 nhóm.
- Kiểm tra cú pháp JavaScript.
- Kiểm thử logic trong Node: dựng nội dung 197 bài và 985 ví dụ; thư viện đủ 197 bài; đánh dấu hoàn thành/chưa học; lưu và tải tiến độ; bảo vệ nội dung câu tự viết; đủ mốc ôn 1–3–7–14–30 ngày; từ chối một số cấu trúc nhập sai; xử lý lỗi ghi localStorage.
- lessons.json giữ nguyên byte so với V1.

## Đã sửa trong mã
- Bỏ giới hạn 100 kết quả khiến bài 101–197 khó truy cập.
- Bổ sung tìm kiếm trong bản dịch và ngữ cảnh ví dụ.
- Lần ôn “Đã nhớ” đầu tiên hẹn sau 1 ngày.
- Ngày ôn dùng định dạng YYYY-MM-DD theo giờ địa phương, không phụ thuộc locale của trình duyệt.
- Kiểm tra cấu trúc và giá trị dữ liệu trước khi nhập, giữ xác nhận trước khi thay thế.
- Thông báo khi trình duyệt không ghi được tiến độ.
- Service worker chỉ xóa cache có tiền tố của ứng dụng, giới hạn phạm vi đường dẫn và ưu tiên bản mới khi có mạng.
- Bổ sung CSS cho nội dung dài trên màn hình hẹp.

## Đã chuẩn bị, chưa xác minh
- Workflow GitHub Actions: kiểm dữ liệu, cú pháp, logic và Playwright; triển khai Pages từ main khi kiểm tra đạt.
- Bộ kiểm thử trình duyệt tại 1440×1000 và 390×844, bao gồm tất cả bài, bộ lọc, ghi chú, tiến độ, sao lưu/nhập, hủy xóa và offline.
- Không chạy được bộ kiểm thử trình duyệt: tải Chromium thất bại (gói tải về không phải ZIP hợp lệ).
- Chưa kiểm tra phát âm bằng giọng đọc thật; chưa kiểm tra cài PWA trên điện thoại vật lý.

## Chưa triển khai
- Kết nối GitHub xác nhận người dùng dangduythu; truy vấn repository đích trả 404.
- Công cụ GitHub hiện có không cung cấp tạo repository hay cấu hình Pages.
- Chưa đẩy commit, chưa chạy Actions trên GitHub, chưa có URL website đã được xác nhận.
- Không thao tác repository PE Management, không xóa dữ liệu người dùng, không thay đổi bảo mật tài khoản.

## Giới hạn V1
- Chưa có hội thoại AI, chấm phát âm, thu âm, tài khoản hoặc đồng bộ thiết bị.
- Phát tiếng dựa trên giọng có sẵn của trình duyệt; khả năng offline tùy thiết bị.
- Tiến độ gắn với trình duyệt và origin website; đổi tên miền cần xuất/nhập sao lưu thủ công.
- Kiểm tra dữ liệu tự động không thay thế thẩm định ngôn ngữ từng câu.

## Tiếp tục triển khai
1. Tạo repository riêng english-communication-ai trong tài khoản dangduythu; kiểm tra lựa chọn public/private và điều kiện Pages miễn phí trước khi tạo.
2. Đẩy nhánh main chứa V1 gốc và develop/v1-quality-pages chứa sửa lỗi.
3. Mở PR từ develop vào main; kiểm tra CI trước khi merge.
4. Bật Pages với nguồn GitHub Actions, chạy deploy.
5. Mở URL do bước deploy trả về, kiểm tra trên desktop/mobile trước khi thông báo hoàn thành.

Chạy cục bộ: `python3 tests/verify_data.py`, `npm run test:logic`.
Kiểm thử trình duyệt: `npm ci`, `npx playwright install --with-deps chromium`, `npm test`.
