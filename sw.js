const CACHE='barat-static-v8-8-0';
const STATIC=['./bus-7810.pdf','./emploi-du-temps-hugo.pdf'];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(STATIC)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;

  const url=new URL(req.url);

  if(
    req.mode==='navigate' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('/famille-barat/')
  ){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    fetch(req)
      .then(res=>{
        const copy=res.clone();
        caches.open(CACHE)
          .then(c=>c.put(req,copy))
          .catch(()=>{});
        return res;
      })
      .catch(()=>caches.match(req))
  );
});
