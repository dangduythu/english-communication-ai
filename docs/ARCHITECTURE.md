# English Communication AI — Kiến trúc V1 và hướng phát triển

## 1. Kiến trúc V1 đã triển khai

```text
Browser (Desktop / Mobile)
├── index.html + style.css           UI responsive
├── app.js                           Router, state, logic học
├── data/lessons.json                197 bài / 985 ví dụ, UTF-8
├── localStorage                      Tiến độ, câu tự viết, lịch ôn
├── SpeechSynthesis API              Đọc ví dụ tiếng Anh
├── manifest.webmanifest              Cài đặt PWA
└── sw.js                             Cache assets / dùng offline sau lượt tải đầu
```

Không sử dụng dịch vụ AI, tài khoản, nhận diện giọng nói hoặc backend ở phiên bản này. Các chức năng này **chưa được triển khai**.

## 2. Từ Excel đến JSON

Nguồn: sheet `LO TRINH MOI NGAY` (`A2:J198`), sheet `VI DU ANH VIET` (`A2:H986`). Khóa liên kết là `Ngày học` = `Ngày`. Không chỉnh sửa câu gốc. Mỗi bài có `id`, `group`, `pattern`, `usage`, `formula`, `sampleEn`, `sampleVi`, `examples[]`. Mỗi ví dụ có `order`, `en`, `vi`, `context`, `prompt`.

Các bài học cần được biên tập lại nếu muốn tính điểm phát âm/đối thoại theo mẫu chính xác, vì ví dụ có thể là biến thể thay vì chứa nguyên văn mẫu câu.

## 3. Local state V1

Key: `english-communication-ai:v1`.

```json
{
  "completed": {"1": "2026-10-28"},
  "notes": {"1": "How is work going?"},
  "reviews": {"1": {"step": 1, "due": "2026-10-31", "last": "2026-10-28"}},
  "startedAt": "2026-10-28"
}
```

- `completed` là ngày hoàn thành bài (YYYY-MM-DD).
- `notes` là câu tự viết cho từng bài.
- `reviews` lưu bậc, ngày đến hạn, ngày gần nhất.
- Một bài đã hoàn thành chưa có lượt đánh giá ôn tập được đưa vào danh sách ôn.
- V1 có lịch ôn 1,3,7,14,30 ngày: chọn `Đã nhớ` tăng bậc; `Cần luyện lại` quay về 1 ngày.

## 4. Mô hình dữ liệu V2 với PostgreSQL / Supabase

Xem `schema-v2.sql`. Khóa ID bài học giữ nguyên 1–197 để đảm bảo nhập dữ liệu lịch sử. Bảng chính:

| Bảng | Mục đích | Khóa quan trọng |
|---|---|---|
| profiles | Người học | user_id UUID |
| lesson_groups | Nhóm chủ đề | group_id |
| lessons | Cấu trúc, công thức | lesson_id integer |
| examples | Câu ví dụ | example_id; lesson_id FK |
| lesson_progress | Hoàn thành, ngày học | (user_id, lesson_id) |
| learner_notes | Câu tự đặt | note_id; user_id; lesson_id |
| review_schedule | Lịch ôn có trạng thái | (user_id, lesson_id) |
| review_events | Lịch sử lần ôn | event_id |
| practice_sessions | Lịch sử bài luyện | session_id |
| speech_attempts | Lượt nói & đánh giá | attempt_id |
| conversation_sessions | Đối thoại AI | conversation_id |
| conversation_messages | Nội dung trao đổi | message_id |

Bật RLS cho từng bảng dữ liệu cá nhân; backend kiểm tra phiên đăng nhập, không expose service role key ở frontend.

## 5. Kế hoạch chuyển đổi mã nguồn

**Mốc A — V1 (đã tạo source)**: app tĩnh, 6 màn hình, dữ liệu đầy đủ, speechSynthesis, localStorage, backup/restore, PWA.

**Mốc B — V1.1 (tuần 1–2 sau khi chạy thử)**: kiểm thử trên Chrome/Edge/Safari, sửa UI, kiểm tra 197 bài, accessibility, bổ sung nhập liệu đúng chuẩn và biên tập câu ví dụ.

**Mốc C — V1.5 (tuần 3–5)**: chuyển app.js thành React + TypeScript/Vite; tách lớp `services/`, `repositories/`, `components/`, `pages/`, `hooks/`; đưa lessons lên Supabase; đăng nhập, đồng bộ, import tiến độ localStorage. Viết migration versioned, có backup và rollback.

**Mốc D — V2 (tuần 6–9)**: backend FastAPI `/api/speech/transcribe`, `/api/feedback`, `/api/conversations`; thêm rate limiting, request logging ẩn nội dung nhạy cảm, kiểm soát chi phí, xóa âm thanh theo vòng đời; AI sửa câu và hội thoại theo tình huống.

**Mốc E — V2.5 (tuần 10–12)**: thử nghiệm đánh giá phát âm chuyên biệt, báo cáo kỹ năng, thử nghiệm người dùng, tối ưu PWA và năng lực offline. Lịch chỉ là ước lượng dự kiến.

## 6. API đề xuất khi có backend

- `GET /api/v1/lessons?group=&q=&page=` — lọc bài
- `GET /api/v1/lessons/{id}` — chi tiết + 5 ví dụ
- `PUT /api/v1/me/progress/{lessonId}` — cập nhật trạng thái, idempotent
- `POST /api/v1/me/reviews` — ghi sự kiện ôn và cập nhật hạn tiếp
- `GET /api/v1/me/dashboard` — tổng hợp
- `POST /api/v1/me/notes` — tạo / sửa câu
- `POST /api/v2/speech/transcribe` — tương lai
- `POST /api/v2/feedback` — tương lai
- `POST /api/v2/conversations` — tương lai

## 7. Hạn chế và tiêu chí nghiệm thu

- V1 lưu tiến độ **trên từng trình duyệt**; xóa dữ liệu website có thể xóa tiến độ nếu không sao lưu.
- SpeechSynthesis lệ thuộc giọng cài trên OS/trình duyệt; không dùng API cho audio chất lượng cao.
- PWA hoạt động offline sau lần tải đầu đủ thành phần; cần HTTP localhost hoặc HTTPS để đăng ký service worker.
- Không có cơ chế chấm điểm phát âm hoặc AI; không quảng bá như đã có.
- Nghiệm thu V1: 197 bài, 985 ví dụ, 5 ví dụ mỗi bài, lọc/tìm, hoàn thành, ôn, lưu câu, xuất/nhập backup, layout mobile/desktop và test offline.
