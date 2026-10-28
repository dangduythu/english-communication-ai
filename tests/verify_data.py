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

# V2 content is separate: the original curriculum is never rewritten.
from collections import Counter
import re
vocab=json.loads((p/'data/vocabulary.json').read_text())
exercises=json.loads((p/'data/exercises.json').read_text())
assert len(vocab['entries'])==432
assert len({w['id'] for w in vocab['entries']})==432
for w in vocab['entries']:
 assert w['en'].strip() and w['vi'].strip() and w['translation'].strip()
 assert w['en'].lower() in w['example'].lower()
 assert w['lessonIds'] and all(1<=i<=197 for i in w['lessonIds'])
for lesson in data:
 ids=vocab['byLesson'][str(lesson['id'])]
 assert 5<=len(ids)<=6
 assert all(any(w['id']==id and lesson['id'] in w['lessonIds'] for w in vocab['entries']) for id in ids)
 qs=[q for q in exercises if q['lessonId']==lesson['id']]
 assert len(qs)==3 and {q['type'] for q in qs}=={'choice','cloze','order'}
 for q in qs:
  assert q['answer'].strip() and q['explanation'].strip()
  if q['type']=='choice':assert len(set(q['options']))==4 and q['answer'] in q['options']
  if q['type']=='cloze':assert q['prompt'].count('____')==1 and q['prompt'].replace('____',q['answer'])==q['correctSentence']
  if q['type']=='order':assert Counter(q['tokens'])==Counter(q['answer'].split())
assert len(exercises)==591 and len({q['id'] for q in exercises})==591
print('PASS V2: 432 linked bilingual entries, 591 grounded exercises, five or six entries and three exercise types per lesson')
meeting=next(w for w in vocab['entries'] if w['en']=='meeting')
assert 'nice meeting' not in meeting['example'].lower(), 'noun meeting must not use a greeting gerund as its example'
assert 2 not in meeting['lessonIds'], 'greeting gerund is not the noun meaning meeting'

for q in exercises:
 if 'acceptedAnswers' in q:
  assert q['type']!='choice' and q['acceptedAnswers']
  assert all(isinstance(x,str) and x.strip() for x in q['acceptedAnswers'])
print('PASS V2.1: reviewed alternate answers and original curriculum preserved')
