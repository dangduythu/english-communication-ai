const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const data=JSON.parse(fs.readFileSync('data/lessons.json')),app={innerHTML:''},store=new Map();
const ctx=vm.createContext({console,Date,JSON,Number,String,Boolean,Math,Error,Array,Object,RegExp,setTimeout,clearTimeout,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},document:{querySelector:s=>s==='#app'?app:null,querySelectorAll:()=>[]},window:{scrollTo:()=>{}},navigator:{},location:{protocol:'http:'},fetch:async()=>({ok:true,json:async()=>data})});
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
run("localStorage.setItem=()=>{throw Error('quota')}");assert.equal(run('save()'),false);
console.log('PASS: 197 lesson renders / 985 examples, library, completion, escaped notes, persistence, all review intervals, invalid imports, storage failure');})().catch(e=>{console.error(e);process.exitCode=1});
