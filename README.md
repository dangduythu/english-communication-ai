# English Communication AI · V2

Web/PWA luyện giao tiếp tiếng Anh với 197 bài học, 985 ví dụ Anh–Việt, 432 mục từ vựng và 591 bài tập có chấm điểm.

Website: https://dangduythu.github.io/english-communication-ai/

## Chức năng
- Học cấu trúc, nghe ví dụ và lưu câu tự viết.
- Học từ vựng theo bài; lưu vào sổ từ, học thẻ và ôn cách quãng.
- Trắc nghiệm, điền từ, sắp xếp câu; chấm điểm và giải thích lỗi.
- Tách kết quả lần đầu với kết quả gần nhất; ôn lại câu từng sai.
- Theo dõi tiến độ; sao lưu/khôi phục JSON V1 và V2; offline sau lần tải đầu.

Tiến độ lưu trong trình duyệt hiện tại. Chưa có tài khoản, đồng bộ đám mây, hội thoại AI hoặc chấm phát âm. Giọng đọc dùng khả năng có sẵn của trình duyệt. Câu tự viết chưa được chấm tự động.

## Chạy và kiểm tra

```sh
python3 -m http.server 8000
python3 tests/verify_data.py
npm ci
npm run test:logic
npx playwright install --with-deps chromium
npm test
```

Mở `http://localhost:8000/` để dùng ứng dụng. Bộ kiểm thử tự mở server tại đường dẫn con giống GitHub Pages.

Chi tiết dữ liệu và tương thích: [docs/V2.md](docs/V2.md). Bản V1 gốc được lưu trên nhánh `archive/v1-original`.
