# T-English · V2.1

Ứng dụng học giao tiếp tiếng Anh trên web và bản HTML độc lập cho máy tính.

Website: https://dangduythu.github.io/english-communication-ai/

## Chức năng
- Giữ nguyên 197 bài học và 985 ví dụ; 432 mục từ/cụm câu và 591 câu luyện tập.
- Sổ từ, nghe mẫu, ôn thẻ từ và ôn câu sai theo lịch.
- Trắc nghiệm, điền từ, sắp xếp câu; đáp án bổ sung được duyệt; giải thích và luyện lại.
- Mục tiêu học hằng ngày, đếm duy nhất từng bài/từ/câu trong ngày.
- Bài kiểm tra chủ đề 12 câu, lưu điểm lần trả lời đầu của từng lượt.
- Phân tích điểm yếu theo từ và cấu trúc; lưu và xuất phản ánh bài tập.
- Đọc sao lưu V1/V2 và lưu sao lưu có toàn bộ dữ liệu V2.1.

## Bản mở trực tiếp trên máy tính

Tải `T-English_V2.1_PC.zip`, giải nén rồi mở `T-English.html` bằng Chrome/Edge. Không cần Python, Node hay máy chủ. Tệp HTML đã nhúng toàn bộ dữ liệu và mã cần thiết. Giữ tệp ở vị trí cố định, dùng cùng trình duyệt và sao lưu định kỳ.

Tiến độ trên website và tệp cục bộ tách biệt: xuất JSON ở bản đang dùng rồi nhập vào bản muốn chuyển đến. Không có đồng bộ tự động. Giọng đọc tùy thiết bị, có giọng cần mạng. Phản ánh không tự gửi đi. Chưa dùng AI để chấm câu tự viết/phát âm.

## Phát triển và kiểm thử

```sh
python3 -m http.server 8000
npm ci
python3 tests/verify_data.py
npm run test:logic
npx playwright install --with-deps chromium
npm test
```

`npm test` tạo gói máy tính rồi kiểm thử web, giả lập điện thoại và tệp `file://` khi tắt mạng. `python3 scripts/build_desktop.py` tạo riêng bản đóng gói trong `release/`. Xem [docs/V2.1.md](docs/V2.1.md).
