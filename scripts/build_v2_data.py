"""Build a curated bilingual glossary linked to original, unchanged V1 examples."""
import json,re,hashlib,random
from pathlib import Path
root=Path(__file__).resolve().parents[1]
lessons=json.loads((root/'data/lessons.json').read_text())
# Each translation below is authored for the usage in the learning corpus.
raw='''today|hôm nay
family|gia đình
work|công việc; làm việc
weekend|cuối tuần
production line|dây chuyền sản xuất
nice|vui; tốt đẹp
meet|gặp gỡ
team|nhóm
pleasure|niềm vui
finally|cuối cùng
colleague|đồng nghiệp
engineer|kỹ sư
daughter|con gái
report|báo cáo
issue|vấn đề
department|phòng ban
process|quy trình
supplier|nhà cung cấp
material|vật liệu
meeting|cuộc họp
training|đào tạo
productive|hiệu quả; có năng suất
trip|chuyến đi
day|ngày
morning|buổi sáng
evening|buổi tối
night|ban đêm
information|thông tin
manager|người quản lý
responsible|chịu trách nhiệm
location|vị trí
schedule|lịch trình
quantity|số lượng
price|giá tiền
cost|chi phí
time|thời gian
minute|phút
hour|giờ
week|tuần
month|tháng
year|năm
question|câu hỏi
answer|câu trả lời
sample|mẫu
samples|các mẫu
result|kết quả
results|các kết quả
data|dữ liệu
quality|chất lượng
defect|lỗi sản phẩm
defects|các lỗi sản phẩm
problem|vấn đề; khó khăn
machine|máy móc
line|dây chuyền; hàng
room|phòng
office|văn phòng
check|kiểm tra
help|giúp đỡ
need|cần
want|muốn
please|làm ơn; vui lòng
thank you|cảm ơn
sorry|xin lỗi
welcome|được chào đón; hoan nghênh
happy|vui vẻ
fine|ổn; tốt
busy|bận rộn
tired|mệt mỏi
ready|sẵn sàng
available|có sẵn; còn trống
free|rảnh; miễn phí
important|quan trọng
urgent|khẩn cấp
stable|ổn định
unstable|không ổn định
correct|đúng; chính xác
incorrect|không đúng
new|mới
old|cũ
latest|mới nhất
main|chính
first|đầu tiên
last|cuối cùng; vừa qua
next|tiếp theo
another|một cái khác
same|giống nhau; cùng một
better|tốt hơn
best|tốt nhất
more|nhiều hơn
less|ít hơn
many|nhiều (danh từ đếm được)
much|nhiều (danh từ không đếm được)
start|bắt đầu
finish|hoàn thành; kết thúc
stop|dừng lại
continue|tiếp tục
review|xem lại; ôn tập
explain|giải thích
repeat|lặp lại
understand|hiểu
mean|có nghĩa là
know|biết
think|nghĩ
believe|tin tưởng
agree|đồng ý
disagree|không đồng ý
suggest|đề xuất
recommend|khuyến nghị
prefer|thích hơn
hope|hy vọng
wish|ước
feel|cảm thấy
look|nhìn; trông có vẻ
sound|nghe có vẻ
find|tìm thấy
found|đã tìm thấy
try|thử; cố gắng
trying|đang thử; đang cố gắng
learn|học
learning|việc học
English|tiếng Anh
word|từ
words|các từ
book|sách; đặt chỗ
read|đọc
reading|việc đọc
write|viết
send|gửi
sent|đã gửi
receive|nhận
received|đã nhận
email|thư điện tử
call|gọi điện
reply|trả lời
response|phản hồi
feedback|ý kiến phản hồi
update|cập nhật
updated|được cập nhật
change|thay đổi
changes|các thay đổi
decision|quyết định
confirm|xác nhận
confirmed|đã xác nhận
approval|sự phê duyệt
approve|phê duyệt
wait|chờ
waiting|đang chờ
pending|đang chờ xử lý
deadline|hạn chót
extend|gia hạn
extension|sự gia hạn
plan|kế hoạch
planning|việc lập kế hoạch
project|dự án
target|mục tiêu
goal|mục tiêu cần đạt
improve|cải thiện
improved|đã cải thiện
improvement|sự cải tiến
reduce|giảm
reduced|đã giảm
reduction|sự giảm bớt
increase|tăng; sự gia tăng
increased|đã tăng
decrease|giảm; sự suy giảm
decreased|đã giảm
prevent|ngăn ngừa
prevention|sự phòng ngừa
recurrence|sự tái diễn
recurring|tái diễn
focus on|tập trung vào
root cause|nguyên nhân gốc rễ
cause|nguyên nhân; gây ra
evidence|bằng chứng
investigation|việc điều tra
verify|xác minh
test|kiểm thử; phép thử
test result|kết quả kiểm thử
trial|đợt chạy thử
method|phương pháp
conditions|các điều kiện
settings|các thông số cài đặt
sensor|cảm biến
loose|bị lỏng
damaged|bị hỏng
vacuum|chân không
plate|tấm; đĩa
flat|phẳng
operator|người vận hành
operators|những người vận hành
step|bước
steps|các bước
mixed|bị trộn lẫn
contamination|sự nhiễm bẩn
power failure|mất điện
scratch|vết xước
bubble|bong bóng khí
bubbles|các bong bóng khí
trapped air|khí bị giữ lại
humidity|độ ẩm không khí
temperature|nhiệt độ
equipment|thiết bị
variation|sự biến thiên
handling|việc thao tác; xử lý
moisture|hơi ẩm
liner|lớp lót
thick|dày
damage|hư hỏng
night shift|ca đêm
shift|ca làm việc
maintenance|bảo trì
inspection|kiểm tra chất lượng
purchasing|mua hàng
yield|tỷ lệ sản phẩm đạt
output|sản lượng
downtime|thời gian dừng máy
productivity|năng suất
scrap|phế phẩm
labor cost|chi phí nhân công
cost reduction|giảm chi phí
cost saving|tiết kiệm chi phí
shipment|lô hàng; việc giao hàng
customer|khách hàng
customer complaint|khiếu nại của khách hàng
complaints|các khiếu nại
complaint|khiếu nại
risk|rủi ro
benefit|lợi ích
safety|an toàn
safe|an toàn
traceability|khả năng truy xuất nguồn gốc
procedure|quy trình hướng dẫn
sample size|cỡ mẫu
fixture|đồ gá
fixtures|các đồ gá
standardizing|việc tiêu chuẩn hóa
checklist|danh sách kiểm tra
monitor|theo dõi
monitoring|việc theo dõi
collect|thu thập
collecting|việc thu thập
follow up|theo dõi tiếp; đôn đốc
action|hành động
action plan|kế hoạch hành động
corrective action|hành động khắc phục
preventive actions|các hành động phòng ngừa
effective|có hiệu quả
observed|đã được quan sát
setup|thiết lập ban đầu
mistakes|các sai sót
trend|xu hướng
chart|biểu đồ
compared with|so với
according to|theo như
as a result|kết quả là
therefore|do đó
however|tuy nhiên
although|mặc dù
because of|bởi vì; do
in addition|ngoài ra
for example|ví dụ
in other words|nói cách khác
in my opinion|theo ý kiến của tôi
on the other hand|mặt khác
it depends on|điều đó phụ thuộc vào
on track|đúng tiến độ
behind schedule|chậm tiến độ
ahead of schedule|sớm hơn tiến độ
on schedule|đúng lịch
recovery plan|kế hoạch khôi phục tiến độ
acceptable|có thể chấp nhận
completed|đã hoàn thành
phase|giai đoạn
frequency|tần suất
launch|ra mắt; triển khai
train|đào tạo; tàu hỏa
remove|loại bỏ
major|chủ yếu; quan trọng
prevention|sự phòng ngừa
significant|đáng kể
slight|nhẹ; nhỏ
monthly|hằng tháng
planned|đã lên kế hoạch
lack of|sự thiếu
ownership|trách nhiệm phụ trách
suspect|nghi ngờ
related to|liên quan đến
whether|liệu rằng
involved|có liên quan
stabilize|làm ổn định
retrain|đào tạo lại
twice|hai lần
purchase|mua
release|cho xuất; phát hành
replace|thay thế
replacing|việc thay thế
longer|lâu hơn
insufficient|không đủ
training|đào tạo
label|nhãn; dán nhãn
labeled|đã được dán nhãn
locked|đã khóa
informed|được thông báo
prioritize|ưu tiên
highest|cao nhất
loss|tổn thất
agenda|chương trình họp
topic|chủ đề
purpose|mục đích
identify|xác định
assign|phân công
responsibilities|các trách nhiệm
highlight|nhấn mạnh
points|các điểm
potential|tiềm ẩn; có tiềm năng
finding|phát hiện
clarify|làm rõ
definition|định nghĩa
proposal|đề xuất
operation|công đoạn; hoạt động
criteria|các tiêu chí
single owner|một người phụ trách duy nhất
analysis|phân tích
team leader|trưởng nhóm
booking|việc đặt chỗ
summarize|tóm tắt
management|ban quản lý
requirement|yêu cầu
impact|tác động
long-term|dài hạn
on hold|tạm hoãn
order|đặt món; đơn hàng
noodles|mì
chicken rice|cơm gà
coffee|cà phê
sandwiches|bánh mì kẹp
peanuts|đậu phộng
menu|thực đơn
water|nước
bill|hóa đơn thanh toán
receipt|biên lai
window seat|ghế cạnh cửa sổ
pharmacy|nhà thuốc
gift|quà tặng
shirt|áo sơ mi
airport|sân bay
train station|ga tàu
city center|trung tâm thành phố
address|địa chỉ
bus stop|trạm xe buýt
nearest|gần nhất
window|cửa sổ
child|đứa trẻ
bike|xe đạp
course|khóa học
parents|cha mẹ
day off|ngày nghỉ
go home|về nhà
stay home|ở nhà
go out|đi ra ngoài
walk|đi bộ
drive|lái xe
text|nhắn tin
leave|rời đi
early|sớm
late|muộn
ahead|trước; về phía trước
vacation|kỳ nghỉ
food|thức ăn
class|lớp học
free time|thời gian rảnh
raining|đang mưa
rain|mưa
closer|gần hơn
soon|sớm
sequence|trình tự
tea|trà
walking|việc đi bộ
driving|việc lái xe
assumptions|các giả định
interesting|thú vị
risky|có rủi ro
complicated|phức tạp
expected|được dự kiến
product|sản phẩm
suggestions|các gợi ý
trouble|khó khăn
sleeping|việc ngủ
understanding|việc hiểu
opening|việc mở
remembering|việc ghi nhớ
worth|đáng
investing|việc đầu tư
options|các lựa chọn
afford|có đủ khả năng chi trả
ignore|bỏ qua
lose|mất
join|tham gia
on time|đúng giờ
take a break|nghỉ giải lao
progress|tiến độ
home|nhà
arrive|đến nơi
patience|sự kiên nhẫn
delay|sự chậm trễ; trì hoãn
confusion|sự nhầm lẫn
interrupting|việc ngắt lời
inconvenience|sự bất tiện
closed|đã đóng cửa
seat|chỗ ngồi
restroom|nhà vệ sinh
repeat|lặp lại
reschedule|đổi lịch
my pleasure|rất hân hạnh
anytime|bất cứ lúc nào
slowly|chậm rãi
last part|phần cuối
another way|một cách khác
remotely|từ xa
together|cùng nhau
appreciate|trân trọng; đánh giá cao
contact|liên hệ
chair|ghế
ideas|các ý tưởng
copy|bản sao
situation|tình huống
moment|một lát
call you back|gọi lại cho bạn
let me know|hãy cho tôi biết
have a good|chúc một ... tốt lành
nice to meet you|rất vui được gặp bạn
no problem|không có vấn đề gì
no worries|đừng lo
you're welcome|không có gì (đáp lại lời cảm ơn)
excuse me|xin phép; xin lỗi để gây chú ý
would you mind|bạn có phiền không
feel free to|cứ tự nhiên
'''
terms={}
for row in raw.strip().splitlines():
 en,vi=row.split('|',1); terms[en.lower()]={'en':en,'vi':vi,'kind':'phrase' if ' ' in en else 'word'}
def key(en): return 'v-'+hashlib.sha1(en.lower().encode()).hexdigest()[:12]
def match(term,text):return re.search(r'(?<![a-z])'+re.escape(term)+r'(?![a-z])',text,re.I)
bank={}; links={}; exercises=[]
for l in lessons:
 matches=[]
 for term,entry in terms.items():
  example=next((e for e in l['examples'] if match(term,e['en'])),None)
  if example:
   # Phrases and content words first, rather than counting function words.
   priority=(0 if ' ' in term else 1, -len(term),term)
   matches.append((priority,entry,example))
 matches.sort(key=lambda x:x[0]); chosen=matches[:6]
 # Short conversational lessons also study their complete, translated expressions.
 used={e['en'].lower() for _,e,_ in chosen}
 for ex in l['examples']:
  if len(chosen)>=5:break
  if ex['en'].lower() not in used:chosen.append(((2,0,''),{'en':ex['en'],'vi':ex['vi'],'kind':'expression'},ex));used.add(ex['en'].lower())
 ids=[]
 for _,entry,ex in chosen:
  vid=key(entry['en']); ids.append(vid)
  if vid not in bank:bank[vid]={'id':vid,**entry,'example':ex['en'],'translation':ex['vi'],'lessonIds':[]}
  bank[vid]['lessonIds'].append(l['id'])
 links[str(l['id'])]=ids
 # One of each exercise type per lesson, all answers grounded in V1 content.
 entry=bank[ids[0]]
 alternatives=sorted({e['vi'] for e in terms.values() if e['vi']!=entry['vi']})
 rng=random.Random(l['id']); options=rng.sample(alternatives,3)+[entry['vi']];rng.shuffle(options)
 exercises.append({'id':f'{l["id"]}-choice','lessonId':l['id'],'type':'choice','prompt':f'Chọn nghĩa của “{entry["en"]}”.','options':options,'answer':entry['vi'],'vocabId':entry['id'],'explanation':f'“{entry["en"]}” trong bài này có nghĩa là “{entry["vi"]}”.','context':entry['example']})
 ex=next(e for e in l['examples'] if match(entry['en'],e['en']))
 blanked=re.sub(r'(?<![a-z])'+re.escape(entry['en'])+r'(?![a-z])','____',ex['en'],count=1,flags=re.I)
 exercises.append({'id':f'{l["id"]}-cloze','lessonId':l['id'],'type':'cloze','prompt':blanked,'hint':ex['vi'],'answer':match(entry['en'],ex['en']).group(),'vocabId':entry['id'],'correctSentence':ex['en'],'explanation':f'Điền “{entry["en"]}” với nghĩa “{entry["vi"]}” trong câu này. Đối chiếu nghĩa tiếng Việt và giữ nguyên phần còn lại của câu.'})
 ex=l['examples'][2]
 sentence=ex['en'].lower()
 if re.match(r'^(how|what|where|when|why|which) (is|are|was|were|do|does|did|can|could|will|would|have|has)\b',sentence):
  rule='Câu hỏi dùng từ hỏi trước trợ động từ hoặc động từ to be, rồi đến chủ ngữ và phần còn lại.'
 elif re.match(r'^(is|are|was|were|do|does|did|can|could|will|would|have|has)\b',sentence):
  rule='Câu hỏi Yes/No thường đặt trợ động từ hoặc động từ to be trước chủ ngữ.'
 elif sentence.startswith("let's "):
  rule="Lời đề nghị dùng Let's + động từ nguyên mẫu, sau đó là phần bổ sung."
 elif sentence.startswith('please '):
  rule='Lời yêu cầu lịch sự dùng Please + động từ nguyên mẫu và phần bổ sung.'
 else:
  rule='Đối chiếu nghĩa tiếng Việt và ghép các cụm từ theo thứ tự trong câu mẫu; chú ý vị trí chủ ngữ, động từ và phần bổ sung.'
 tokens=ex['en'].split();indices=list(range(len(tokens)));rng.shuffle(indices)
 if indices==list(range(len(tokens))):indices=indices[1:]+indices[:1]
 exercises.append({'id':f'{l["id"]}-order','lessonId':l['id'],'type':'order','prompt':'Sắp xếp các từ theo nghĩa tiếng Việt.','hint':ex['vi'],'answer':ex['en'],'tokens':[tokens[i] for i in indices],'explanation':rule,'correctSentence':ex['en']})
(root/'data/vocabulary.json').write_text(json.dumps({'entries':list(bank.values()),'byLesson':links},ensure_ascii=False,indent=2)+'\n')
(root/'data/exercises.json').write_text(json.dumps(exercises,ensure_ascii=False,indent=2)+'\n')
print(f'{len(bank)} vocabulary entries; {len(exercises)} exercises; all {len(links)} lessons linked; minimum {min(map(len,links.values()))} entries per lesson')
