const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const lessons=JSON.parse(fs.readFileSync(path.join(root,'data/lessons.json')));
const vocabulary=JSON.parse(fs.readFileSync(path.join(root,'data/vocabulary.json')));
const exercises=JSON.parse(fs.readFileSync(path.join(root,'data/exercises.json')));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://local').pathname);
 if(!pathname.startsWith('/english-communication-ai/')){res.writeHead(404).end();return}
 const name=pathname.slice('/english-communication-ai/'.length)||'index.html';
 const file=path.resolve(root,name);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(data)});
});
(async()=>{
 if(!process.env.BASE_URL)await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=process.env.BASE_URL||`http://127.0.0.1:${server.address().port}/english-communication-ai/`;
 const browser=await chromium.launch({headless:true});
 try{
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const context=await browser.newContext({viewport,acceptDownloads:true,reducedMotion:'reduce'});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const legacy={completed:{},notes:{1:'V1 note retained'},reviews:{},startedAt:'2026-10-01'};
  await context.addInitScript(seed=>{if(!localStorage.getItem('english-communication-ai:v1'))localStorage.setItem('english-communication-ai:v1',JSON.stringify(seed))},legacy);
  await page.goto(url);await page.locator('[data-nav="library"]').first().click();
  assert.equal(await page.locator('[data-open]').count(),197);
  for(const lesson of lessons){
   await page.locator(`[data-open="${lesson.id}"]`).click();
   assert.equal(await page.locator('.example').count(),5);
   for(let i=0;i<5;i++)assert.equal(await page.locator('.example strong').nth(i).textContent(),lesson.examples[i].en);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow lesson ${lesson.id}, width ${viewport.width}`);
   await page.locator('[data-nav="library"]').first().click();
   if(lesson.id%50===0)console.log(`Checked ${lesson.id}/197 lessons at ${viewport.width}px`);
  }
  await page.locator('#query').fill('zzzz-no-match');assert.equal(await page.locator('[data-open]').count(),0);
  await page.locator('#query').fill('');
  const groups=await page.locator('#group option').allTextContents();
  for(const group of groups.slice(1)){await page.locator('#group').selectOption({label:group});assert.equal(await page.locator('[data-open]').count(),lessons.filter(l=>l.group===group).length)}
  await page.locator('#group').selectOption('all');
  await checkV2(page,legacy,viewport);
  await checkV21(page,viewport);
  await page.locator('[data-nav="library"]').first().click();
  await page.locator('[data-open="197"]').click();
  await page.locator('#user-note').fill('My saved sentence.');await page.locator('[data-save-note]').click();await page.locator('[data-complete]').click();
  await page.reload();await page.locator('[data-nav="progress"]').first().click();assert.match(await page.locator('.metric').first().textContent(),/1 bài/);
  await page.locator('[data-nav="review"]').first().click();await page.locator('[data-review="197:easy"]').click();
  let state=await page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1')));
  assert.equal(state.notes[197],'My saved sentence.');assert.equal(state.reviews[197].step,0);
  assert.equal((new Date(state.reviews[197].due)-new Date(state.reviews[197].last))/86400000,1);
  await page.locator('[data-nav="settings"]').first().click();
  const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();
  const download=await downloadPromise;const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.deepEqual(backup.data,state);
  await page.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,data:{completed:null,notes:[],reviews:{}}}))});
  await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('Không thể nhập'),null,{timeout:5000});
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1'))),state);
  page.once('dialog',d=>d.dismiss());await page.locator('#reset').click();
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1'))),state);
  page.once('dialog',d=>d.accept());await page.locator('#import').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('thành công'),null,{timeout:5000});
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1'))),state);
  page.once('dialog',d=>d.accept());await page.locator('#reset').click();
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1')).completed),{});
  page.once('dialog',d=>d.accept());await page.locator('#import').setInputFiles({name:'restored.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('thành công'),null,{timeout:5000});
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;await caches.open('unrelated-application');});
  await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.ok((await page.evaluate(()=>caches.keys())).includes('unrelated-application'));
  await context.setOffline(true);await page.reload();await page.locator('[data-nav="library"]').first().click();assert.equal(await page.locator('[data-open]').count(),197);
  await page.locator('[data-nav="vocabulary"]').first().click();await page.locator('#vfilter').selectOption('saved');assert.ok(await page.locator('.vocab-card').count()>0);
  await page.locator('[data-nav="practice"]').first().click();assert.ok(await page.locator('.exercise').count()>0);
  assert.deepEqual(errors,[]);
  await page.locator('[data-nav="home"]').first().click();
  fs.mkdirSync(path.join(root,'test-results'),{recursive:true});
  await page.screenshot({path:path.join(root,'test-results',`home-${viewport.width}.png`),fullPage:true});
  console.log(`PASS ${viewport.width}px: all 197 lessons / 985 examples, filters, notes, completion, statistics, review, backup/import, reset cancellation, offline, layout`);
  await context.close();
 }
 await checkCorruptRecovery(browser,url);
 await checkDesktop(browser,url);
 }finally{await browser.close()}
})().then(()=>server.close()).catch(e=>{console.error(e);server.close();process.exitCode=1});

async function checkV2(page,legacy,viewport){
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1')));
 await page.locator('[data-nav="vocabulary"]').first().click();
 await page.locator('#vlesson').selectOption('2');assert.ok(!(await page.locator('.vocab-card h3').allTextContents()).includes('meeting'),'outdated or wrong meeting sense in lesson 2');
 await page.locator('#vlesson').selectOption('1');
 assert.ok(await page.locator('.vocab-card').count()>=5);
 const wordId=vocabulary.byLesson['1'][0];
 await page.locator(`[data-save-word="${wordId}"]`).click();
 await page.locator(`[data-word-status="${wordId}"]`).selectOption('learning');
 assert.equal((await state()).words[wordId].status,'learning');
 await page.locator(`[data-word-status="${wordId}"]`).selectOption('unknown');
 await page.locator('#flash-start').click();await page.locator('#flash-reveal').click();await page.locator('[data-flash-grade="known"]').click();await page.locator('#flash-close').click();
 assert.equal((await state()).words[wordId].status,'known');
 fs.mkdirSync(path.join(root,'test-results'),{recursive:true});await page.screenshot({path:path.join(root,'test-results',`vocabulary-${viewport.width}.png`),fullPage:true});
 await page.locator('#vquery').fill('zzzzz-no-word');assert.equal(await page.locator('.vocab-card').count(),0);await page.locator('#vquery').fill('');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`vocabulary overflow ${viewport.width}`);
 await page.locator('[data-nav="practice"]').first().click();await page.locator('#practice-lesson').selectOption('1');
 const choice=exercises.find(q=>q.id==='1-choice');const correct=choice.options.indexOf(choice.answer);const wrong=(correct+1)%4;
 await page.locator(`input[name="choice"][value="${wrong}"]`).check();await page.locator('#grade-answer').click();
 assert.ok(await page.locator('.feedback.incorrect').isVisible());
 await page.locator('#retry-question').click();await page.locator(`input[name="choice"][value="${correct}"]`).check();await page.locator('#grade-answer').click();
 assert.ok(await page.locator('.feedback.correct').isVisible());
 let saved=await state();assert.equal(saved.answers['1-choice'].firstCorrect,false);assert.equal(saved.answers['1-choice'].lastCorrect,true);assert.equal(saved.answers['1-choice'].attempts,2);
 await page.locator('#next-question').click();const cloze=exercises.find(q=>q.id==='1-cloze');await page.locator('#exercise-answer').fill(' '+cloze.answer.toUpperCase()+'. ');await page.locator('#grade-answer').click();assert.ok(await page.locator('.feedback.correct').isVisible());
 await page.locator('#next-question').click();const order=exercises.find(q=>q.id==='1-order');
 for(let i=0;i<order.tokens.length;i++)await page.locator(`[data-pick="${i}"]`).click();
 await page.locator('#grade-answer').click();assert.match(await page.locator('.feedback').textContent(),/thứ tự chưa đúng/);await page.locator('#retry-question').click();
 const pool=order.tokens.map((t,i)=>({t,i}));for(const t of order.answer.split(' ')){const pos=pool.findIndex(x=>x.t===t);const {i}=pool.splice(pos,1)[0];await page.locator(`[data-pick="${i}"]`).click()}
 await page.locator('#grade-answer').click();assert.ok(await page.locator('.feedback.correct').isVisible());assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`practice overflow ${viewport.width}`);
 await page.screenshot({path:path.join(root,'test-results',`correction-${viewport.width}.png`),fullPage:true});
 await page.locator('#next-question').click();assert.equal(await page.locator('.score-ring').textContent(),'100/100');
 await page.locator('#practice-lesson').selectOption('2');const q2=exercises.find(q=>q.id==='2-choice');await page.locator(`input[name="choice"][value="${(q2.options.indexOf(q2.answer)+1)%4}"]`).check();await page.locator('#grade-answer').click();
 await page.locator('#practice-weak').click();assert.equal(await page.locator('.exercise').getAttribute('data-question'),'2-choice');await page.locator(`input[name="choice"][value="${q2.options.indexOf(q2.answer)}"]`).check();await page.locator('#grade-answer').click();
 saved=await state();assert.equal(saved.answers['1-choice'].firstCorrect,false);assert.equal(saved.answers['1-order'].firstCorrect,false);assert.equal(saved.answers['1-cloze'].firstCorrect,true);assert.equal(saved.answers['2-choice'].lastCorrect,true);
 await page.reload();await page.locator('[data-nav="progress"]').first().click();assert.match(await page.locator('.results-table').textContent(),/Trắc nghiệm/);
 assert.deepEqual((await state()).words,saved.words);assert.deepEqual((await state()).answers,saved.answers);assert.equal((await state()).notes[1],legacy.notes[1]);
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1:before-v2'))),legacy);
 await page.locator('[data-nav="settings"]').first().click();page.once('dialog',d=>d.accept());await page.locator('#import').setInputFiles({name:'v1.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,data:legacy}))});
 await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('thành công'),null,{timeout:5000});assert.deepEqual((await state()).words,saved.words);assert.deepEqual((await state()).answers,saved.answers);
 console.log(`PASS V2 ${viewport.width}px: V1 migration, vocabulary, flashcards, three exercise types, first vs retry scores, corrections, mistake queue, persistence and legacy import`);
}

async function checkCorruptRecovery(browser,url){
 for(const raw of ['{broken JSON',JSON.stringify({completed:null,notes:{},reviews:{}})]){
  const context=await browser.newContext({reducedMotion:'reduce'});await context.addInitScript(raw=>{if(!localStorage.getItem('english-communication-ai:v1'))localStorage.setItem('english-communication-ai:v1',raw)},raw);
  const page=await context.newPage();await page.goto(url);await page.locator('[data-nav="settings"]').first().click();assert.ok(await page.locator('#export-raw').isVisible());
  const restored={completed:{1:'2026-10-01'},notes:{1:'Recovered note'},reviews:{},startedAt:'2026-10-01'};
  assert.equal(await page.evaluate(()=>localStorage.getItem('english-communication-ai:v1')),raw);
  page.once('dialog',d=>d.accept());await page.locator('#import').setInputFiles({name:'recovery.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,data:restored}))});
  await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('thành công'),null,{timeout:5000});
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1')));assert.deepEqual(saved.completed,restored.completed);assert.equal(saved.notes[1],'Recovered note');
  assert.equal(await page.evaluate(()=>localStorage.getItem('english-communication-ai:v1:before-v2')),raw);
  await page.reload();await page.locator('[data-nav="settings"]').first().click();assert.equal(await page.locator('#export-raw').count(),0);await context.close();
 }
 console.log('PASS recovery: malformed and structurally invalid local data remain preserved and can be replaced by a valid confirmed backup');
}

async function answerCorrectly(page,q){
 if(q.type==='choice')await page.locator(`input[name="choice"][value="${q.options.indexOf(q.answer)}"]`).check();
 if(q.type==='cloze')await page.locator('#exercise-answer').fill(q.acceptedAnswers?.[0]||q.answer);
 if(q.type==='order'){const pool=q.tokens.map((t,i)=>({t,i}));for(const t of q.answer.split(' ')){const pos=pool.findIndex(x=>x.t===t);const {i}=pool.splice(pos,1)[0];await page.locator(`[data-pick="${i}"]`).click()}}
 await page.locator('#grade-answer').click();assert.ok(await page.locator('.feedback.correct').isVisible());
}
async function checkV21(page,viewport){
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1')));
 await page.locator('[data-nav="home"]').first().click();assert.match(await page.title(),/T-English/);
 await page.locator('.daily-plan summary').click();await page.locator('#goal-lessons').fill('2');await page.locator('#goal-words').fill('7');await page.locator('#goal-questions').fill('9');await page.locator('#save-goals').click();assert.deepEqual((await read()).goals,{lessons:2,words:7,questions:9});
 await page.locator('[data-nav="quiz"]').first().click();await page.locator('#quiz-group').selectOption('Chào hỏi');await page.locator('#start-quiz').click();
 for(let i=0;i<12;i++){
  const id=await page.locator('.exercise').getAttribute('data-question');const q=exercises.find(q=>q.id===id);assert.ok(q);
  if(i===0){await page.locator(`input[name="choice"][value="${(q.options.indexOf(q.answer)+1)%4}"]`).check();await page.locator('#grade-answer').click();assert.ok(await page.locator('.feedback.incorrect').isVisible());await page.locator('#retry-question').click()}
  await answerCorrectly(page,q);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`quiz overflow ${viewport.width}`);await page.locator('#next-question').click();
 }
 let data=await read();assert.equal(data.quizzes.at(-1).correct,11);assert.equal(data.quizzes.at(-1).score,92);assert.equal(data.quizzes.at(-1).group,'Chào hỏi');assert.equal(await page.locator('.score-ring').textContent(),'92/100');
 await page.locator('[data-nav="practice"]').first().click();await page.locator('#practice-lesson').selectOption('1');const before=Object.values((await read()).activity).reduce((n,a)=>n+a.questions.length,0);await answerCorrectly(page,exercises.find(q=>q.id==='1-choice'));const after=Object.values((await read()).activity).reduce((n,a)=>n+a.questions.length,0);assert.equal(after,before,'retry must not inflate daily unique count');
 await page.locator('[data-report="1-choice"]').click();const comment='Đáp án cần giải thích thêm. <script>alert(1)</script>';await page.locator('#report-comment').fill(comment);await page.locator('#submit-report').click();assert.equal((await read()).reports.at(-1).comment,comment);
 await page.locator('[data-nav="settings"]').first().click();const downloadPromise=page.waitForEvent('download');await page.locator('#export-reports').click();const file=await downloadPromise;const reports=JSON.parse(fs.readFileSync(await file.path(),'utf8'));assert.equal(reports.reports.at(-1).comment,comment);
 data=await read();const invalid=JSON.parse(JSON.stringify(data));invalid.goals.words=-1;await page.locator('#import').setInputFiles({name:'bad-v21.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:2,data:invalid}))});await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('Không thể nhập'),null,{timeout:5000});assert.deepEqual(await read(),data);
 await page.reload();await page.locator('[data-nav="progress"]').first().click();assert.equal((await read()).quizzes.at(-1).score,92);assert.match(await page.locator('main').textContent(),/Điểm yếu cần tập trung/);assert.deepEqual((await read()).goals,{lessons:2,words:7,questions:9});
 await page.screenshot({path:path.join(root,'test-results',`v21-progress-${viewport.width}.png`),fullPage:true});
 console.log(`PASS V2.1 ${viewport.width}px: branding, daily goals, unique daily counts, topic quiz and immutable first-session score, feedback reports/export, validation and weak-point analytics`);
}
async function checkDesktop(browser,webUrl){
 const {pathToFileURL}=require('node:url');const desktopUrl=pathToFileURL(path.join(root,'release/T-English.html')).href;
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const context=await browser.newContext({viewport,acceptDownloads:true,reducedMotion:'reduce',offline:true});const page=await context.newPage();const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url())});
  await page.goto(desktopUrl);await page.locator('[data-nav="library"]').first().click();assert.equal(await page.locator('[data-open]').count(),197);await page.locator('[data-open="197"]').click();assert.equal(await page.locator('.example').count(),5);
  await page.locator('[data-nav="vocabulary"]').first().click();await page.locator('#vlesson').selectOption('1');const wordId=vocabulary.byLesson['1'][0];await page.locator(`[data-save-word="${wordId}"]`).click();
  await page.locator('[data-nav="practice"]').first().click();await page.locator('#practice-lesson').selectOption('1');await answerCorrectly(page,exercises.find(q=>q.id==='1-choice'));
  await page.locator('[data-nav="settings"]').first().click();assert.match(await page.locator('main').textContent(),/Bản dùng trên máy tính/);const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(backup.data.words[wordId].status,'unknown');assert.equal(backup.data.answers['1-choice'].lastCorrect,true);
  await page.reload();await page.locator('[data-nav="settings"]').first().click();assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('english-communication-ai:v1')).words[id].status,wordId),'unknown');
  // Real web -> standalone backup transfer; contexts are intentionally isolated.
  const web=await browser.newContext({reducedMotion:'reduce',acceptDownloads:true});const wp=await web.newPage();await wp.goto(webUrl);await wp.locator('[data-nav="settings"]').first().click();wp.once('dialog',d=>d.accept());await wp.locator('#import').setInputFiles({name:'desktop.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await wp.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('thành công'),null,{timeout:5000});const transferred=await wp.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1')));assert.deepEqual(transferred,backup.data);
  await wp.locator('[data-nav="learn"]').first().click();await wp.locator('#user-note').fill('Transferred from website to desktop');await wp.locator('[data-save-note]').click();await wp.locator('[data-nav="settings"]').first().click();const webDownloadPromise=wp.waitForEvent('download');await wp.locator('#export').click();const webDownload=await webDownloadPromise;const webBackup=JSON.parse(fs.readFileSync(await webDownload.path(),'utf8'));await web.close();
  page.once('dialog',d=>d.accept());await page.locator('#import').setInputFiles({name:'from-website.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(webBackup))});await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('thành công'),null,{timeout:5000});await page.reload();await page.locator('[data-nav="settings"]').first().click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1')).notes[1]),'Transferred from website to desktop');
  await page.locator('[data-nav="vocabulary"]').first().click();await page.screenshot({path:path.join(root,'test-results',`desktop-file-${viewport.width}.png`),fullPage:true});assert.deepEqual(errors,[]);assert.deepEqual(requests,[],'standalone must not make any HTTP request');await context.close();
 }
 console.log('PASS desktop file: opens via file:// fully offline, zero HTTP requests, all lessons, vocabulary, grading, backup export, progress after reload and two-way backup transfer with website');
}
