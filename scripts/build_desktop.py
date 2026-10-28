"""Build a deterministic, dependency-free, double-click desktop edition."""
from pathlib import Path
import json,re,zipfile,base64
root=Path(__file__).resolve().parents[1]
out=root/'release';out.mkdir(exist_ok=True)
bundle={name:json.loads((root/'data'/file).read_text()) for name,file in [('lessons','lessons.json'),('vocabulary','vocabulary.json'),('exercises','exercises.json')]}
html=(root/'index.html').read_text()
html=re.sub(r'<link rel="manifest"[^>]*>','',html)
icon=base64.b64encode((root/'assets/icon.svg').read_bytes()).decode()
html=re.sub(r'<link rel="icon"[^>]*>',f'<link rel="icon" href="data:image/svg+xml;base64,{icon}">',html)
html=re.sub(r'<link rel="stylesheet"[^>]*>',lambda m:'<style>'+(root/'style.css').read_text()+'</style>',html)
data='<script id="t-english-data" type="application/json">'+json.dumps(bundle,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+'</script><script>window.T_ENGLISH_BUNDLE=JSON.parse(document.getElementById("t-english-data").textContent);</script>'
core=(root/'core.js').read_text().replace('</script','<\\/script')
app=(root/'app.js').read_text().replace('</script','<\\/script')
html=re.sub(r'<script src="\./core.js[^\"]*"></script>',lambda m:data+'<script>'+core+'</script>',html)
html=re.sub(r'<script type="module" src="\./app.js[^\"]*"></script>',lambda m:'<script>'+app+'</script>',html)
assert 'src="./app.js' not in html and 'src="./core.js' not in html
assert 'window.T_ENGLISH_BUNDLE=' in html
(out/'T-English.html').write_text(html,encoding='utf-8')
guide='''T-ENGLISH V2.1 — BẢN DÙNG TRÊN MÁY TÍNH

1. Giải nén toàn bộ tệp ZIP vào một thư mục cố định.
2. Nhấp đúp T-English.html, mở bằng Google Chrome hoặc Microsoft Edge.
   Có thể bấm chuột phải > Open with / Mở bằng > chọn trình duyệt.
3. Không cần Python, Node.js, máy chủ hay cài đặt thêm để học.

CHUYỂN TIẾN ĐỘ TỪ WEBSITE
- Mở website cũ, vào Cài đặt > Xuất dữ liệu.
- Mở T-English.html > Cài đặt > Nhập dữ liệu, chọn tệp sao lưu vừa xuất.
- Cũng có thể xuất ở bản này rồi nhập lại vào website hoặc máy khác.
- Không có đồng bộ tự động giữa website, bản tải về và các trình duyệt.

GIỮ DỮ LIỆU AN TOÀN
Giữ tệp T-English.html ở cùng vị trí và dùng cùng một trình duyệt, tránh chế độ ẩn danh nếu muốn giữ tiến độ sau khi đóng. Tiến độ được lưu trong trình duyệt, không ghi trực tiếp vào tệp HTML. Di chuyển/đổi tên tệp hoặc đổi trình duyệt có thể làm tiến độ cũ không xuất hiện. Hãy xuất sao lưu định kỳ và trước khi di chuyển, nâng cấp hoặc dọn dữ liệu trình duyệt. Nếu trình duyệt chặn lưu trữ, chương trình sẽ báo không lưu được; hãy xuất sao lưu trước khi đóng.

CHỨC NĂNG V2.1
197 bài / 985 ví dụ gốc; 432 mục từ; 591 câu luyện tập; đáp án bổ sung đã duyệt; thẻ từ và ôn câu sai; mục tiêu hằng ngày; kiểm tra chủ đề 12 câu; phân tích từ/cấu trúc yếu; lưu và xuất phản ánh bài tập.

GIỚI HẠN
Chấm theo đáp án và quy tắc, chưa có AI chấm câu tự viết hoặc phát âm. Phản ánh chỉ lưu cục bộ, không tự gửi đi. Phần học và chấm bài hoạt động không cần mạng; nút nghe phụ thuộc giọng đọc có sẵn của thiết bị/trình duyệt, một số giọng cần mạng. Chưa nghiệm thu trên mọi phiên bản Windows/macOS và điện thoại vật lý.

Website: https://dangduythu.github.io/english-communication-ai/
Mã nguồn: https://github.com/dangduythu/english-communication-ai
'''
(out/'HUONG_DAN.txt').write_text(guide,encoding='utf-8-sig')
with zipfile.ZipFile(out/'T-English_V2.1_PC.zip','w',compression=zipfile.ZIP_DEFLATED) as z:
 for name in ['T-English.html','HUONG_DAN.txt']:
  info=zipfile.ZipInfo(name,date_time=(2026,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o644<<16;z.writestr(info,(out/name).read_bytes())
print('Built release/T-English.html and release/T-English_V2.1_PC.zip')
