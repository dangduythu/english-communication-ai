# English Communication AI · V1

Phần mềm luyện giao tiếp tiếng Anh Web/PWA, được xây dựng trực tiếp từ Excel của người dùng: **197 bài, 985 ví dụ, 8 nhóm chủ đề**.

## Khởi động (không cần cài npm)

1. Giải nén thư mục.
2. Cài Python 3 nếu máy chưa có.
3. Mở terminal tại thư mục `english-communication-ai-v1`.
4. Chạy:

```bash
python -m http.server 8000
```

5. Truy cập **http://localhost:8000** bằng Chrome hoặc Edge.

Không mở `index.html` trực tiếp bằng `file://` vì fetch JSON/PWA không hoạt động như mong muốn.

## Chạy trên mạng / điện thoại

Để dùng trên điện thoại từ một máy khác, triển khai thư mục lên host HTTPS tĩnh như Cloudflare Pages, Netlify, GitHub Pages (cần đặt đúng base path), hoặc máy chủ HTTPS của bạn. PWA chỉ được cài trong ngữ cảnh bảo mật (localhost hoặc HTTPS).

## Tính năng V1

- Dashboard và bài học tiếp theo tự động.
- 197 cấu trúc, 5 câu ví dụ mỗi bài, dịch tiếng Việt.
- Phát âm mẫu bằng Web Speech Synthesis của trình duyệt.
- Ghi câu tự đặt, đánh dấu hoàn thành, tiến độ theo nhóm.
- Tìm kiếm, lọc, ôn tập 1/3/7/14/30 ngày.
- Export / import backup JSON; lưu localStorage.
- PWA cache dữ liệu để mở offline sau lần truy cập đầu tiên thành công.

## Cấu trúc

```text
index.html                HTML app shell
style.css                 Giao diện responsive
app.js                    UI logic và trình điều hướng
data/lessons.json         Dữ liệu gốc chuyển từ Excel
manifest.webmanifest      Cấu hình PWA
sw.js                     Service worker
assets/icon.svg           Icon
docs/ARCHITECTURE.md      Kiến trúc, API, kế hoạch mã nguồn
docs/schema-v2.sql        Thiết kế CSDL PostgreSQL cho V2
```

## Các hạn chế cần biết

- V1 không có AI, không chấm phát âm và chưa có đăng nhập.
- Tiến độ nằm ở localStorage theo trình duyệt; sao lưu trước khi xóa dữ liệu website.
- Giọng đọc phụ thuộc vào giọng được cung cấp bởi thiết bị và browser.
- Nội dung Excel được nhập nguyên văn, chưa biên tập chất lượng từng câu.
- Source V1 chỉ dùng HTML/CSS/JS native, để không yêu cầu cài package và dễ chạy thử; kế hoạch React + TypeScript/FastAPI/Supabase mô tả ở `docs/ARCHITECTURE.md`.

## Kiểm tra tự động

```bash
python tests/verify_data.py
```
