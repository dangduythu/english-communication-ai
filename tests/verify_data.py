import json
from pathlib import Path
p=Path(__file__).resolve().parents[1]
data=json.loads((p/'data/lessons.json').read_text(encoding='utf-8'))
assert len(data)==197, '197 lessons'
assert [x['id'] for x in data]==list(range(1,198)), 'lesson IDs'
assert sum(len(x['examples']) for x in data)==985,'985 examples'
assert len({x['group'] for x in data})==8,'8 groups'
for lesson in data:
 assert len(lesson['examples'])==5, f'Lesson {lesson["id"]} should have 5 examples'
 assert all(e['en'] and e['vi'] for e in lesson['examples'])
 assert [e['order'] for e in lesson['examples']]==[1,2,3,4,5]
print('PASS: 197 lessons, 985 valid examples, 8 groups, unique IDs, 5 examples per lesson')
