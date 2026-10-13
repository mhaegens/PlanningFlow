import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createExplorerServer } from '../server.mjs';

const secret = 'test-only-' + randomBytes(24).toString('hex') + '& + €';
let time = Date.now();
const server = await createExplorerServer({ env: { APP_PASSWORD: secret, NODE_ENV: 'test', ALLOW_INSECURE_HTTP: '1' }, now: () => time });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const request = (path, options = {}) => fetch(base + path, { redirect: 'manual', ...options });
const cookieValue = (res, name) => res.headers.getSetCookie().find(x => x.startsWith(name + '='))?.split(';')[0];
async function gate() {
  const res = await request('/'); const text = await res.text();
  return { cookie: cookieValue(res, 'cpp_gate'), csrf: text.match(/name="csrf" value="([^"]+)"/)[1], text, res };
}
const submit = (g, password, extra = {}) => request('/login', { method: 'POST', headers: { Origin: base, Cookie: g.cookie, 'Content-Type': 'application/x-www-form-urlencoded', ...(extra.headers || {}) }, body: new URLSearchParams({ password, csrf: g.csrf, next: extra.next || '/' }) });
async function login() { const g = await gate(), res = await submit(g, secret); assert.equal(res.status, 303); return cookieValue(res, 'cpp_session'); }

test('Server refuses an unset password or insecure production mode', async () => {
  await assert.rejects(createExplorerServer({ env: {} }), /APP_PASSWORD/);
  await assert.rejects(createExplorerServer({ env: { APP_PASSWORD: ' ', NODE_ENV: 'production' } }), /APP_PASSWORD/);
  await assert.rejects(createExplorerServer({ env: { APP_PASSWORD: secret, NODE_ENV: 'production', ALLOW_INSECURE_HTTP: '1' } }), /local development/);
});
test('Anonymous gate contains no real app and every private asset is denied', async () => {
  const g = await gate(); assert.equal(g.res.status, 200); assert.match(g.text, /Open explorer/);
  assert(!g.text.includes(secret)); assert(!g.text.includes('content.js')); assert(!g.text.includes('data-node'));
  for (const url of ['/content.js','/planning.js','/completeness.js','/diagram.js','/app.js','/style.css','/assets/icons.json','/assets/72-Regular.otf','/dist/index.html','/server.mjs','/.env','/.git/config','/gate-assets/../content.js','/gate-assets/%2e%2e/content.js','/session-check.js']) {
    const r = await request(url); assert.equal(r.status, 401, url); assert.equal(await r.text(), 'Sign in required.');
  }
  const head = await request('/content.js', { method: 'HEAD' }); assert.equal(head.status, 401); assert.equal(await head.text(), '');
  assert.equal((await request('/gate-assets/preview.png')).status, 200);
  assert.equal((await request('/healthz')).status, 200);
});
test('CSRF and origin checks protect login, and errors never echo passwords', async () => {
  const g = await gate();
  assert.equal((await submit(g, secret, { headers: { Origin: 'https://unrelated.example' } })).status, 403);
  assert.equal((await submit(g, secret, { headers: { Cookie: '' } })).status, 403);
  assert.equal((await submit({ ...g, csrf: g.csrf.slice(0,-1)+'x' }, secret)).status, 403);
  const wrong = await submit(g, 'wrong-&-password'); assert.equal(wrong.status, 401);
  const text = await wrong.text(); assert.match(text, /not correct/); assert(!text.includes(secret)); assert(!text.includes('wrong-&-password'));
  const large = await request('/login', { method:'POST', headers:{Origin:base,'Content-Type':'application/x-www-form-urlencoded'},body:'x'.repeat(9000) }); assert.equal(large.status,413);
});
test('Valid login creates an opaque HttpOnly session and rejects open redirects', async () => {
  const g = await gate(), r = await submit(g, secret, { next: 'https://unrelated.example/' });
  assert.equal(r.status, 303); assert.equal(r.headers.get('Location'), '/');
  const raw = r.headers.getSetCookie().find(x => x.startsWith('cpp_session=')); assert.match(raw,/HttpOnly/); assert.match(raw,/SameSite=Strict/); assert(!raw.includes(secret));
  const auth = cookieValue(r,'cpp_session'), page = await request('/',{headers:{Cookie:auth}}); const html = await page.text();
  assert.match(html,/Printer configuration, planning and fulfilment/); assert.match(html,/Sign out/); assert(!html.includes(secret)); assert.match(page.headers.get('Cache-Control'),/no-store/);
  assert.match(page.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
  for(const path of ['/content.js','/assets/icons.json','/style.css']) assert.equal((await request(path,{headers:{Cookie:auth}})).status,200);
  for(const path of ['/server.mjs','/.env','/dist/content.js']) assert.equal((await request(path,{headers:{Cookie:auth}})).status,404);
  assert.equal((await request('/content.js?session='+auth.split('=')[1])).status,401);
  assert.equal((await request('/content.js',{headers:{Cookie:auth.slice(0,-1)+'x'}})).status,401);
  assert.equal((await request('/content.js',{headers:{Cookie:auth+'; '+auth}})).status,401);
});
test('Logout is protected and revokes even a copied session cookie', async()=>{
  const auth=await login(), page=await request('/',{headers:{Cookie:auth}}), html=await page.text(), csrf=html.match(/name="csrf" value="([^"]+)"/)[1];
  const logout=(origin,token)=>request('/logout',{method:'POST',headers:{Origin:origin,Cookie:auth,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({csrf:token})});
  assert.equal((await logout('https://unrelated.example',csrf)).status,403);assert.equal((await logout(base,'invalid')).status,403);
  assert.equal((await logout(base,csrf)).status,303);assert.equal((await request('/content.js',{headers:{Cookie:auth}})).status,401);
});
test('Session idle timeout and absolute lifetime are enforced on the server',async()=>{
  const idle=await login();time+=60*60*1000+1;assert.equal((await request('/content.js',{headers:{Cookie:idle}})).status,401);
  const absolute=await login();for(let i=0;i<8;i++){time+=55*60*1000;assert.equal((await request('/content.js',{headers:{Cookie:absolute}})).status,200);}time+=45*60*1000;
  assert.equal((await request('/content.js',{headers:{Cookie:absolute}})).status,401);
});
test('Fresh gate cookies cannot bypass password-attempt limiting',async()=>{
  for(let i=0;i<5;i++)assert.equal((await submit(await gate(),'wrong')).status,401);
  const blocked=await submit(await gate(),secret);assert.equal(blocked.status,429);assert(Number(blocked.headers.get('Retry-After'))>0);
  time+=15*60*1000+1;assert.equal((await submit(await gate(),secret)).status,303);
});
test('Production requires HTTPS and issues Secure host-bound cookies',async()=>{
  const prod=await createExplorerServer({env:{APP_PASSWORD:secret,NODE_ENV:'production',TRUST_PROXY:'1'}});await new Promise(r=>prod.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${prod.address().port}`;
  try{
    assert.equal((await fetch(url+'/',{redirect:'manual'})).status,308);assert.equal((await fetch(url+'/healthz')).status,200);
    const g=await fetch(url+'/',{headers:{'X-Forwarded-Proto':'https'}}),csrf=(await g.text()).match(/name="csrf" value="([^"]+)"/)[1];const gc=cookieValue(g,'__Host-cpp-gate');
    const res=await fetch(url+'/login',{method:'POST',redirect:'manual',headers:{Origin:url.replace('http:','https:'),'X-Forwarded-Proto':'https',Cookie:gc,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({password:secret,csrf})});
    assert.equal(res.status,303);const session=res.headers.getSetCookie().find(x=>x.startsWith('__Host-cpp-session='));assert.match(session,/Secure/);assert.match(session,/HttpOnly/);assert.match(session,/Path=\//);assert(!session.includes('Domain='));
    assert.equal((await fetch(url+'/content.js',{headers:{'X-Forwarded-Proto':'https',Cookie:cookieValue(res,'__Host-cpp-session')}})).status,200);
  }finally{await new Promise(r=>prod.close(r));}
});
test.after(async()=>{await new Promise(resolve=>server.close(resolve));});
