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
 }finally{await browser.close()}
})().then(()=>server.close()).catch(e=>{console.error(e);server.close();process.exitCode=1});

async function checkV2(page,legacy,viewport){
 const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1')));
 await page.locator('[data-nav="vocabulary"]').first().click();
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
