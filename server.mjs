import http from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { randomBytes, createHash, createHmac, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { isIP } from 'node:net';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const derive = promisify(scrypt);
const SESSION_AGE = 8 * 60 * 60 * 1000;
const IDLE_AGE = 60 * 60 * 1000;
const GATE_AGE = 10 * 60 * 1000;
const ATTEMPT_WINDOW = 15 * 60 * 1000;
const MAX_BODY = 8192;
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.otf': 'font/otf', '.txt': 'text/plain; charset=utf-8' };
const CSP = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'; object-src 'none'";
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const digest = value => createHash('sha256').update(value).digest('hex');
const equals = (a, b) => timingSafeEqual(createHash('sha256').update(a).digest(), createHash('sha256').update(b).digest());

async function loadFiles(directory, prefix = '') {
  const files = new Map();
  for (const item of await readdir(directory, { withFileTypes: true })) {
    if (item.name.startsWith('.') || item.isSymbolicLink()) continue;
    const relative = prefix + item.name;
    if (item.isDirectory()) for (const entry of await loadFiles(path.join(directory, item.name), relative + '/')) files.set(...entry);
    else if (item.isFile()) files.set('/' + relative, { body: await readFile(path.join(directory, item.name)), type: MIME[path.extname(item.name)] || 'text/plain; charset=utf-8' });
  }
  return files;
}

function readForm(req) {
  return new Promise((resolve, reject) => {
    let size = 0, exceeded = false;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) { exceeded = true; chunks.length = 0; }
      else if (!exceeded) chunks.push(chunk);
    });
    req.on('end', () => exceeded ? reject(Object.assign(new Error('Large form'), { status: 413 })) : resolve(new URLSearchParams(Buffer.concat(chunks).toString('utf8'))));
    req.on('error', reject);
    req.on('aborted', () => reject(new Error('Aborted request')));
  });
}

export async function createExplorerServer({ env = process.env, now = Date.now } = {}) {
  const password = env.APP_PASSWORD;
  if (typeof password !== 'string' || !password.trim() || Buffer.byteLength(password) > 1024) throw new Error('Set APP_PASSWORD to a nonempty password of at most 1024 bytes.');
  const insecure = env.ALLOW_INSECURE_HTTP === '1';
  if (insecure && env.NODE_ENV === 'production') throw new Error('ALLOW_INSECURE_HTTP is only permitted for local development.');
  const secure = !insecure, trustProxy = env.TRUST_PROXY === '1';
  const cookieName = secure ? '__Host-cpp-session' : 'cpp_session';
  const gateCookie = secure ? '__Host-cpp-gate' : 'cpp_gate';
  const salt = randomBytes(16), csrfKey = randomBytes(32);
  const expected = await derive(password, salt, 64);
  const sessions = new Map(), attempts = new Map();
  let hashesInFlight = 0;
  const privateFiles = await loadFiles(path.join(ROOT, 'dist'));
  // Only this small, explicit set is available before authentication.
  const publicPaths = ['/gate-assets/gate.css', '/gate-assets/gate.js', '/gate-assets/preview.png', '/gate-assets/canon-logo.png', '/gate-assets/72-Regular.otf', '/gate-assets/72-Bold.otf'];
  const publicFiles = new Map();
  for (const url of publicPaths) publicFiles.set(url, { body: await readFile(path.join(ROOT, 'public', url)), type: MIME[path.extname(url)] });
  const template = await readFile(path.join(ROOT, 'public', 'login.html'), 'utf8');
  const mac = value => createHmac('sha256', csrfKey).update(value).digest('hex');
  const cookie = (name, value, seconds) => `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${seconds}${secure ? '; Secure' : ''}`;
  const cookies = req => {
    const pairs = new Map();
    for (const part of (req.headers.cookie || '').split(';')) {
      const at = part.indexOf('=');
      if (at > 0) {
        const key = part.slice(0, at).trim();
        // Ambiguous duplicate auth cookies are rejected rather than selected.
        pairs.set(key, pairs.has(key) ? '' : part.slice(at + 1).trim());
      }
    }
    return pairs;
  };
  function sessionFor(req) {
    const token = cookies(req).get(cookieName);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    const key = digest(token), session = sessions.get(key);
    if (!session) return null;
    if (now() - session.created >= SESSION_AGE || now() - session.used >= IDLE_AGE) { sessions.delete(key); return null; }
    session.used = now();
    return { ...session, key };
  }
  function headers(res, type = 'text/plain; charset=utf-8') {
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'no-store, private');
    res.setHeader('Vary', 'Cookie');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', CSP);
    if (secure) res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  }
  function send(req, res, status, body, type) {
    headers(res, type); res.statusCode = status;
    res.end(req.method === 'HEAD' ? undefined : body);
  }
  function redirect(res, location, setCookies = []) {
    headers(res); res.writeHead(303, { Location: location, ...(setCookies.length ? { 'Set-Cookie': setCookies } : {}) }); res.end();
  }
  function renderGate(req, res, status = 200, message = '', retryAfter = 0) {
    const tokenBody = `${now()}.${randomBytes(24).toString('hex')}`;
    const csrf = `${tokenBody}.${mac(tokenBody)}`;
    let html = template.replaceAll('{{CSRF}}', csrf).replace('{{NEXT}}', escapeHtml(req.loginNext || '/')).replace('{{ERROR}}', message ? `<p class="form-error" role="alert">${escapeHtml(message)}</p>` : '').replace('{{RETRY}}', retryAfter ? 'disabled' : '');
    res.setHeader('Set-Cookie', cookie(gateCookie, csrf, GATE_AGE / 1000));
    if (retryAfter) res.setHeader('Retry-After', String(retryAfter));
    send(req, res, status, html, MIME['.html']);
  }
  function trustedHost(req) {
    try {
      const raw = req.headers.host || '', u = new URL('https://' + raw);
      return u.host === raw.toLowerCase() && !u.username && !u.password && u.pathname === '/' && !u.search && !u.hash ? raw : null;
    } catch { return null; }
  }
  function sameOrigin(req) {
    const host = trustedHost(req);
    return !!host && req.headers.origin === `${secure ? 'https' : 'http'}://${host}`;
  }
  function validGate(req, value) {
    const saved = cookies(req).get(gateCookie) || '';
    if (typeof value !== 'string' || !value || value.length > 180 || !equals(value, saved)) return false;
    const [issued, nonce, signature, ...extra] = value.split('.');
    const timestamp = Number(issued), age = now() - timestamp;
    return !extra.length && /^[a-f0-9]{48}$/.test(nonce || '') && /^[a-f0-9]{64}$/.test(signature || '') && Number.isFinite(timestamp) && age >= 0 && age < GATE_AGE && equals(signature, mac(`${issued}.${nonce}`));
  }
  function client(req) {
    // One trusted Coolify proxy hop: use its appended client address, never the leftmost user-supplied XFF value.
    const forwarded = trustProxy && String(req.headers['x-forwarded-for'] || '').split(',').at(-1).trim();
    return forwarded && isIP(forwarded) ? forwarded : req.socket.remoteAddress;
  }
  function takeAttempt(req) {
    const key = client(req), prior = attempts.get(key);
    if (!prior || now() >= prior.until) {
      if (attempts.size >= 10000) return 60;
      attempts.set(key, { count: 1, until: now() + ATTEMPT_WINDOW }); return 0;
    }
    if (prior.count >= 5) return Math.max(1, Math.ceil((prior.until - now()) / 1000));
    prior.count++; return 0;
  }
  async function handle(req, res) {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/healthz' && ['GET', 'HEAD'].includes(req.method)) { send(req, res, 200, 'ok\n'); return; }
    const host = trustedHost(req);
    if (!host) { send(req, res, 400, 'Invalid host.'); return; }
    const https = req.socket.encrypted || (trustProxy && req.headers['x-forwarded-proto'] === 'https');
    if (secure && !https) {
      if (['GET', 'HEAD'].includes(req.method)) { headers(res); res.writeHead(308, { Location: 'https://' + host + url.pathname + url.search }); res.end(); }
      else send(req, res, 403, 'HTTPS is required.');
      return;
    }
    if (publicFiles.has(url.pathname) && ['GET', 'HEAD'].includes(req.method)) {
      const file = publicFiles.get(url.pathname); send(req, res, 200, file.body, file.type); return;
    }
    if (url.pathname === '/login' && req.method === 'POST') {
      if (!sameOrigin(req)) { send(req, res, 403, 'Please open the login page and try again.'); return; }
      if ((req.headers['content-type'] || '').split(';')[0] !== 'application/x-www-form-urlencoded') { send(req, res, 415, 'Unsupported form.'); return; }
      if (Number(req.headers['content-length']) > MAX_BODY) { req.resume(); send(req, res, 413, 'Form is too large.'); return; }
      const form = await readForm(req);
      const requestedNext = form.get('next') || '/';
      req.loginNext = /^\/(?:#(?:journey|demand|ibp|compare|reference))?$/.test(requestedNext) ? requestedNext : '/';
      if (!validGate(req, form.get('csrf'))) { renderGate(req, res, 403, 'The login page expired. Please try again.'); return; }
      const retry = takeAttempt(req);
      if (retry) { renderGate(req, res, 429, 'Too many attempts. Please try again in 15 minutes.', retry); return; }
      const candidate = form.get('password') || '';
      if (Buffer.byteLength(candidate) > 1024 || !candidate) { renderGate(req, res, 401, 'That password is not correct. Please try again.'); return; }
      if (hashesInFlight >= 4) { res.setHeader('Retry-After', '2'); renderGate(req, res, 429, 'Please wait a moment and try again.'); return; }
      hashesInFlight++;
      let supplied;
      try { supplied = await derive(candidate, salt, 64); } finally { hashesInFlight--; }
      if (!timingSafeEqual(expected, supplied)) { renderGate(req, res, 401, 'That password is not correct. Please try again.'); return; }
      const token = randomBytes(32).toString('hex'), prior = sessionFor(req);
      if (prior) sessions.delete(prior.key);
      if (sessions.size >= 2000) sessions.delete(sessions.keys().next().value);
      sessions.set(digest(token), { created: now(), used: now(), csrf: randomBytes(32).toString('hex') });
      attempts.delete(client(req));
      const next = form.get('next') || '/';
      redirect(res, /^\/(?:#(?:journey|demand|ibp|compare|reference))?$/.test(next) ? next : '/', [cookie(cookieName, token, SESSION_AGE / 1000), cookie(gateCookie, '', 0)]); return;
    }
    const session = sessionFor(req);
    if (url.pathname === '/logout' && req.method === 'POST') {
      if (!sameOrigin(req)) { send(req, res, 403, 'Invalid request.'); return; }
      if (session) {
        if ((req.headers['content-type'] || '').split(';')[0] !== 'application/x-www-form-urlencoded') { send(req, res, 415, 'Unsupported form.'); return; }
        if (Number(req.headers['content-length']) > MAX_BODY) { req.resume(); send(req, res, 413, 'Form is too large.'); return; }
        const form = await readForm(req);
        if (!equals(form.get('csrf') || '', session.csrf)) { send(req, res, 403, 'Invalid request.'); return; }
        sessions.delete(session.key);
      }
      res.setHeader('Clear-Site-Data', '"cache"');
      redirect(res, '/', [cookie(cookieName, '', 0), cookie(gateCookie, '', 0)]); return;
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); send(req, res, 405, 'Method not allowed.'); return; }
    if (!session) {
      if (['/', '/index.html', '/login'].includes(url.pathname)) renderGate(req, res);
      else send(req, res, 401, 'Sign in required.');
      return;
    }
    if (url.pathname === '/login') { redirect(res, '/'); return; }
    if (url.pathname === '/session-check.js') {
      send(req, res, 200, "window.addEventListener('pageshow',event=>{if(event.persisted)location.reload()});", MIME['.js']); return;
    }
    let filePath;
    try { filePath = decodeURIComponent(url.pathname); } catch { send(req, res, 400, 'Invalid path.'); return; }
    const file = privateFiles.get(filePath === '/' ? '/index.html' : filePath);
    if (!file) { send(req, res, 404, 'Not found.'); return; }
    if (filePath === '/' || filePath === '/index.html') {
      const logout = `<form class="signout-form" method="post" action="/logout"><input type="hidden" name="csrf" value="${session.csrf}"><button type="submit">Sign out</button></form>`;
      const html = file.body.toString('utf8').replace('<img class="sap-logo"', logout + '<img class="sap-logo"').replace('</head>', '<link rel="stylesheet" href="/gate-assets/gate.css"><script src="/session-check.js" defer></script></head>');
      send(req, res, 200, html, MIME['.html']); return;
    }
    send(req, res, 200, file.body, file.type);
  }
  const server = http.createServer({ maxHeaderSize: 16384 }, (req, res) => {
    void handle(req, res).catch(error => {
      if (!res.headersSent && !res.destroyed) send(req, res, error.status || 500, error.status === 413 ? 'Form is too large.' : 'Request could not be completed.');
      else if (!res.writableEnded) res.end();
    });
  });
  server.requestTimeout = 10000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 5000;
  const cleanup = setInterval(() => {
    for (const [key, session] of sessions) if (now() - session.created >= SESSION_AGE || now() - session.used >= IDLE_AGE) sessions.delete(key);
    for (const [key, attempt] of attempts) if (now() >= attempt.until) attempts.delete(key);
  }, 60000).unref();
  server.once('close', () => clearInterval(cleanup));
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const server = await createExplorerServer();
    server.listen(Number(process.env.PORT || 80), process.env.HOST || '0.0.0.0', () => console.log('Canon process explorer server is ready.'));
    const shutdown = () => { server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 10000).unref(); };
    process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
  } catch (error) { console.error(error.message); process.exit(1); }
}
