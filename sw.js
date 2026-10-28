const PREFIX='english-communication-ai-';
const CACHE=PREFIX+'v21-cache-1';
const ASSETS=['./','./index.html','./style.css','./style.css?v=2.1.0','./app.js','./app.js?v=2.1.0','./core.js','./core.js?v=2.1.0','./manifest.webmanifest','./assets/icon.svg','./data/lessons.json','./data/vocabulary.json','./data/vocabulary.json?v=2.1.0','./data/exercises.json','./data/exercises.json?v=2.1.0'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(path=>new Request(path,{cache:'reload'})))).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 event.respondWith(fetch(event.request,{cache:'no-cache'}).then(response=>{
  if(response.ok&&ASSETS.some(path=>new URL(path,self.registration.scope).href===url.href)){
   const copy=response.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,copy)));
  }
  return response;
 }).catch(()=>caches.open(CACHE).then(c=>c.match(event.request)).then(cached=>cached||Response.error())));
});
