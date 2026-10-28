const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const Core=require('../core.js');
const vocabulary=JSON.parse(fs.readFileSync('data/vocabulary.json'));const exercises=JSON.parse(fs.readFileSync('data/exercises.json'));
const data=JSON.parse(fs.readFileSync('data/lessons.json')),app={innerHTML:''},store=new Map();
const ctx=vm.createContext({console,Date,JSON,Number,String,Boolean,Math,Error,Array,Object,RegExp,setTimeout,clearTimeout,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{querySelector:s=>s==='#app'?app:null,querySelectorAll:()=>[]},window:{scrollTo:()=>{},ECA:Core},navigator:{},location:{protocol:'http:'},fetch:async url=>({ok:true,json:async()=>url.includes('vocabulary')?vocabulary:url.includes('exercises')?exercises:data})});
const run=s=>vm.runInContext(s,ctx);run(fs.readFileSync('app.js','utf8'));
(async()=>{await new Promise(r=>setTimeout(r,10));assert.match(app.innerHTML,/985/);
assert.equal(run("(library().match(/data-open=/g)||[]).length"),197);
for(let id=1;id<=197;id++){run(`selected=${id};view='learn';render()`);assert.equal((app.innerHTML.match(/class="example"/g)||[]).length,5);for(const e of data[id-1].examples)assert.ok(app.innerHTML.includes(run(`safe(${JSON.stringify(e.en)})`)))}
run("completion(197);setNote(197,'<script>alert(1)</script>');selected=197;render()");assert.ok(app.innerHTML.includes('&lt;script&gt;'));assert.equal(run('countDone()'),1);assert.equal(run('dueLessons().length'),1);
for(const [step,days] of [[0,1],[1,3],[2,7],[3,14],[4,30],[4,30]]){run("markReview(197,'easy')");assert.equal(run('state.reviews[197].step'),step);assert.equal(run('(new Date(state.reviews[197].due)-new Date(state.reviews[197].last))/86400000'),days)}
run("markReview(197,'again')");assert.equal(run('(new Date(state.reviews[197].due)-new Date(state.reviews[197].last))/86400000'),1);
assert.equal(run('validState(state)'),true);assert.equal(run('JSON.stringify(load())'),run('JSON.stringify(state)'));
for(const bad of ['null','[]','{completed:null,notes:{},reviews:{}}',"{completed:{198:'2026-10-28'},notes:{},reviews:{}}","{completed:{1:'2026-02-30'},notes:{},reviews:{}}",'{completed:{},notes:{1:12},reviews:{}}'])assert.equal(run(`validState(${bad})`),false);
run('completion(197)');assert.equal(run('countDone()'),0);assert.equal(run('dueLessons().length'),0);assert.equal(run('state.notes[197]'),'<script>alert(1)</script>');
assert.equal(Core.grade({type:'cloze',answer:"I'm ready"},' I am READY! '),true);
assert.equal(Core.grade({type:'cloze',answer:'94.5%'},'945%'),false);
assert.equal(Core.grade({type:'order',answer:'I do not know'},"I don't know."),true);
assert.equal(Core.grade({type:'cloze',answer:'can'},"can't"),false);
for(const q of exercises){assert.equal(Core.grade(q,q.answer),true,q.id);assert.equal(Core.grade(q,'definitely-wrong-answer'),false,q.id)}
assert.equal(exercises.length,591);assert.equal(vocabulary.entries.length,432);
for(const l of data){const ids=vocabulary.byLesson[l.id];assert.ok(ids.length>=5);for(const id of ids)assert.ok(vocabulary.entries.some(w=>w.id===id));assert.equal(exercises.filter(q=>q.lessonId===l.id).length,3)}
run('startPractice(1);submitAnswer("wrong")');const first=run('state.answers["1-choice"].firstAnswer');run('resetQuestion();submitAnswer(currentQuestion().answer)');assert.equal(run('state.answers["1-choice"].firstCorrect'),false);assert.equal(run('state.answers["1-choice"].lastCorrect'),true);assert.equal(run('state.answers["1-choice"].attempts'),2);assert.equal(run('validState(state)'),true);
assert.equal(run('state.answers["1-choice"].firstAnswer'),first);
assert.equal(Core.validV2({words:[],answers:{}}),false);
assert.equal(Core.correction({type:'order',answer:'I am ready'},'ready am I').message,'Bạn đã có đủ từ nhưng thứ tự chưa đúng.');

for(const q of exercises)for(const variant of q.acceptedAnswers||[])assert.equal(Core.grade(q,variant),true,q.id+' alternate');
assert.equal(Core.validV21({goals:{lessons:1,words:5,questions:6}}),true);
assert.equal(Core.validV21({goals:{lessons:0,words:5,questions:6}}),false);
assert.equal(Core.validV21({activity:{'2026-10-28':{lessons:[198],words:[],questions:[]}}}),false);
assert.equal(Core.validV21({reports:[{id:'x',questionId:'1-choice',prompt:'x',answer:'',comment:'valid report',at:'bad'}]}),false);
assert.equal(Core.validV21({quizzes:[{id:'x',group:'all',at:new Date().toISOString(),total:12,correct:10,score:100}]}),false);
run('startPractice(1);submitAnswer(currentQuestion().answer)');const n=run('state.activity[today()].questions.length');run('resetQuestion();submitAnswer(currentQuestion().answer)');assert.equal(run('state.activity[today()].questions.length'),n);
run('quizGroup="all";startQuiz()');assert.equal(run('practiceRun.ids.length'),12);assert.equal(run('new Set(practiceRun.ids).size'),12);
for(let i=0;i<12;i++){run('submitAnswer(currentQuestion().answer);advancePractice()')}
assert.equal(run('state.quizzes.at(-1).score'),100);assert.equal(run('state.quizzes.at(-1).total'),12);assert.equal(run('validState(state)'),true);
run("localStorage.setItem=()=>{throw Error('quota')}");assert.equal(run('save()'),false);
console.log('PASS: 197 lesson renders / 985 examples, library, completion, escaped notes, persistence, all review intervals, invalid imports, storage failure');})().catch(e=>{console.error(e);process.exitCode=1});
