const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const lessons=JSON.parse(fs.readFileSync(path.join(root,'data/lessons.json')));
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
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=`http://127.0.0.1:${server.address().port}/english-communication-ai/`;
 const browser=await chromium.launch({headless:true});
 try{
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const context=await browser.newContext({viewport,acceptDownloads:true});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.locator('[data-nav="library"]').first().click();
  assert.equal(await page.locator('[data-open]').count(),197);
  for(const lesson of lessons){
   await page.locator(`[data-open="${lesson.id}"]`).click();
   assert.equal(await page.locator('.example').count(),5);
   for(let i=0;i<5;i++)assert.equal(await page.locator('.example strong').nth(i).textContent(),lesson.examples[i].en);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`overflow lesson ${lesson.id}, width ${viewport.width}`);
   await page.locator('[data-nav="library"]').first().click();
  }
  await page.locator('#query').fill('zzzz-no-match');assert.equal(await page.locator('[data-open]').count(),0);
  await page.locator('#query').fill('');
  const groups=await page.locator('#group option').allTextContents();
  for(const group of groups.slice(1)){await page.locator('#group').selectOption({label:group});assert.equal(await page.locator('[data-open]').count(),lessons.filter(l=>l.group===group).length)}
  await page.locator('#group').selectOption('all');
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
  assert.match(await page.locator('#toast').textContent(),/Không thể nhập/);
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1'))),state);
  page.once('dialog',d=>d.dismiss());await page.locator('#reset').click();
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1'))),state);
  page.once('dialog',d=>d.accept());await page.locator('#import').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await page.waitForFunction(()=>document.querySelector('#toast')?.textContent.includes('thành công'));
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('english-communication-ai:v1'))),state);
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;await caches.open('unrelated-application');});
  await page.reload();await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.ok((await page.evaluate(()=>caches.keys())).includes('unrelated-application'));
  await context.setOffline(true);await page.reload();await page.locator('[data-nav="library"]').first().click();assert.equal(await page.locator('[data-open]').count(),197);
  assert.deepEqual(errors,[]);
  console.log(`PASS ${viewport.width}px: all 197 lessons / 985 examples, filters, notes, completion, statistics, review, backup/import, reset cancellation, offline, layout`);
  await context.close();
 }
 }finally{await browser.close()}
})().then(()=>server.close()).catch(e=>{console.error(e);server.close();process.exitCode=1});
