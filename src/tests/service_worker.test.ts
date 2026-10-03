import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe,expect,it,vi } from 'vitest';

const source = readFileSync('static/sw.js', 'utf8');
function worker() {
  const listeners: Record<string, (event: any) => void> = {};
  const cache = { match: vi.fn(async (_key?: string | Request) => undefined as Response | undefined), put: vi.fn(), addAll: vi.fn(async () => {}) };
  const caches = { open: vi.fn(async () => cache), keys: vi.fn(async () => ['other-app-cache', 'vieworld-pwa-v1', 'vieworld-pwa-v2']), delete: vi.fn() };
  const fetch = vi.fn(async () => { throw new Error('offline'); });
  runInNewContext(source, { self: { location: { origin: 'https://vieworld.test' }, clients: { claim: vi.fn() }, addEventListener: (name: string, fn: (event: any) => void) => { listeners[name] = fn; } }, caches, fetch, URL, Response });
  return { listeners, cache, caches, fetch };
}
describe('Offline public cache boundaries', () => {
  it('only retires VieWorld caches', async () => {
    const w = worker(); let work: Promise<unknown> | undefined;
    w.listeners.activate({ waitUntil: (p: Promise<unknown>) => { work = p; } });
    await work;
    expect(w.caches.delete.mock.calls).toEqual([['vieworld-pwa-v1'], ['vieworld-pwa-v2']]);
  });
  it('does not intercept API, external resources or mutations', () => {
    const w = worker(); const respondWith = vi.fn();
    for (const request of [
      { method: 'GET', url: 'https://vieworld.test/api/profile', mode: 'cors' },
      { method: 'GET', url: 'https://elsewhere.test/images/a.png', mode: 'cors' },
      { method: 'POST', url: 'https://vieworld.test/api/purchase', mode: 'cors' },
    ]) w.listeners.fetch({ request, respondWith });
    expect(respondWith).not.toHaveBeenCalled();
  });
  it('uses HTML fallback for navigation, never for a missing script', async () => {
    const w = worker();
    w.cache.match.mockImplementation(async (key?: string | Request) => key === '/index.html' ? new Response('<html>app</html>') : undefined);
    for (const [mode, path, expected] of [['navigate', '/artist/a', 200], ['cors', '/assets/missing.js', 503]] as const) {
      let response: Promise<Response> | undefined;
      w.listeners.fetch({ request: { method: 'GET', url: `https://vieworld.test${path}`, mode }, respondWith: (p: Promise<Response>) => { response = p; }, waitUntil: vi.fn() });
      expect((await response)!.status).toBe(expected);
    }
  });
  it('returns cached artwork immediately and refreshes its stable URL in the background', async () => {
    const w=worker(); const existing=new Response('old');
    w.cache.match.mockResolvedValue(existing);
    w.fetch.mockResolvedValue(new Response('new', {headers:{'content-type':'image/webp'}}) as never);
    let response:Promise<Response>|undefined; let background:Promise<unknown>|undefined;
    const request={method:'GET',url:'https://vieworld.test/images/item.webp',mode:'cors'};
    w.listeners.fetch({request,respondWith:(p:Promise<Response>)=>{response=p;},waitUntil:(p:Promise<unknown>)=>{background=p;}});
    expect(await (await response)!.text()).toBe('old'); await background;
    expect(w.cache.put).toHaveBeenCalledWith(request,expect.any(Response));
    expect(await w.cache.put.mock.calls[0][1].text()).toBe('new');
  });
  it.each(['/assets/missing.js','/images/missing.webp'])('rejects an SPA HTML fallback for a missing asset: %s',async path=>{
    const w=worker(); w.fetch.mockResolvedValue(new Response('<html>SPA</html>',{headers:{'content-type':'text/html'}}) as never);
    let response:Promise<Response>|undefined;
    w.listeners.fetch({request:{method:'GET',url:`https://vieworld.test${path}`,mode:'cors'},respondWith:(p:Promise<Response>)=>{response=p;},waitUntil:vi.fn()});
    expect((await response)!.status).toBe(503); expect(w.cache.put).not.toHaveBeenCalled();
  });
  it('degrades to a response when CacheStorage is denied instead of rejecting the fetch',async()=>{
    const w=worker(); w.caches.open.mockRejectedValue(new Error('denied'));
    let response:Promise<Response>|undefined;
    w.listeners.fetch({request:{method:'GET',url:'https://vieworld.test/artist/a',mode:'navigate'},respondWith:(p:Promise<Response>)=>{response=p;},waitUntil:vi.fn()});
    expect((await response)!.status).toBe(503);
  });
});
