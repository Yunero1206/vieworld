import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const source=readFileSync('static/sw.js','utf8');
function worker(options: { offline?: boolean; htmlAsset?: boolean; cacheDenied?: boolean }={}) {
  const handlers: Record<string,(event: any)=>void>={};
  const entries=new Map<string,Response>(), precache: string[]=[];
  const key=(request: string|{url:string})=>typeof request==='string'?request:request.url;
  const cache={match:vi.fn(async(request: string|{url:string})=>entries.get(key(request))),put:vi.fn(async(request: string|{url:string},response:Response)=>{entries.set(key(request),response);}),addAll:vi.fn(async(urls:string[])=>{precache.push(...urls);})};
  const caches={open:vi.fn(async()=>{if(options.cacheDenied)throw Error('denied');return cache;}),keys:vi.fn(async()=>['vieworld-pwa-old','vieworld-pwa-v4','unrelated-cache']),delete:vi.fn(async()=>true)};
  const fetch=vi.fn(async()=>{if(options.offline)throw Error('offline');return new Response(options.htmlAsset?'<html>SPA</html>':'resource',{headers:{'content-type':options.htmlAsset?'text/html':'image/webp'}});});
  const self={location:{origin:'https://qa.example.invalid'},clients:{claim:vi.fn(async()=>{})},skipWaiting:vi.fn(),addEventListener:(name:string,handler:(event:any)=>void)=>{handlers[name]=handler;}};
  runInNewContext(source,{self,caches,fetch,URL,Response});
  async function fetchResource(path:string,mode='cors') {
    const pending:Promise<unknown>[]=[]; let response:Promise<Response>|undefined;
    handlers.fetch({request:{method:'GET',url:self.location.origin+path,mode},waitUntil:(p:Promise<unknown>)=>pending.push(p),respondWith:(p:Promise<Response>)=>{response=p;}});
    const result=response?await response:undefined; await Promise.all(pending); return result;
  }
  return {handlers,caches,cache,entries,precache,fetch,self,fetchResource};
}

describe('Service worker image delivery and compatibility',()=>{
  it('precaches the migrated room and keeps existing tabs until normal activation',async()=>{
    const w=worker();let install:Promise<unknown>|undefined;
    w.handlers.install({waitUntil:(p:Promise<unknown>)=>{install=p;}}); await install;
    expect(w.precache).toContain('/images/myspace-room-v2.webp');
    expect(w.precache).toContain('/index.html'); expect(w.self.skipWaiting).not.toHaveBeenCalled();
  });
  it('serves a warm room offline and falls back to cached HTML for navigation',async()=>{
    const w=worker({offline:true});
    w.entries.set('https://qa.example.invalid/images/myspace-room-v2.webp',new Response('cached room',{headers:{'content-type':'image/webp'}}));
    w.entries.set('/index.html',new Response('cached shell',{headers:{'content-type':'text/html'}}));
    expect(await (await w.fetchResource('/images/myspace-room-v2.webp'))!.text()).toBe('cached room');
    expect(await (await w.fetchResource('/me','navigate'))!.text()).toBe('cached shell');
    expect((await w.fetchResource('/images/unavailable.webp'))!.status).toBe(503);
  });
  it('never stores SPA HTML as a successful image response',async()=>{
    const w=worker({htmlAsset:true});
    const response=await w.fetchResource('/images/unavailable.webp');
    expect(response!.status).toBe(503); expect(w.cache.put).not.toHaveBeenCalled();
  });
  it('cache denial does not discard a valid online resource',async()=>{
    const w=worker({cacheDenied:true});
    expect((await w.fetchResource('/images/myspace-room-v2.webp'))!.status).toBe(200);
  });
  it('activation removes only old VieWorld caches, not unrelated data',async()=>{
    const w=worker();let activation:Promise<unknown>|undefined;
    w.handlers.activate({waitUntil:(p:Promise<unknown>)=>{activation=p;}}); await activation;
    expect(w.caches.delete.mock.calls).toEqual([['vieworld-pwa-old']]);
    expect(w.self.clients.claim).toHaveBeenCalledOnce();
  });
});
