// 中州高级中学论坛 Supabase 中转代理（部署在 Zeabur，国内可访问）
// 只转发到固定的 Supabase 项目，不代理其他地址。
const http = require('http');
const https = require('https');

const ORIGIN = 'https://nfdnprdxzviyiyvuzyyu.supabase.co';
const PORT = process.env.PORT || 8080;

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'apikey, authorization, content-type, x-client-info, prefer, range, content-range, accept, accept-language',
  'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'access-control-expose-headers': 'content-range, x-total-count',
  'access-control-max-age': '86400',
};

const server = http.createServer((req, res) => {
  // 健康检查
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json', ...CORS });
    res.end(JSON.stringify({ ok: true, proxy: 'supabase' }));
    return;
  }
  // 预检请求直接放行
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return;
  }
  let target;
  try {
    target = new URL(ORIGIN + req.url);
  } catch (e) {
    res.writeHead(400, { 'content-type': 'application/json', ...CORS });
    res.end(JSON.stringify({ error: 'bad url' }));
    return;
  }
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (k === 'host' || k === 'connection') continue;
    headers[k] = v;
  }
  headers.host = target.host;
  const proxyReq = https.request(target, { method: req.method, headers }, (proxyRes) => {
    const out = {};
    for (const [k, v] of Object.entries(proxyRes.headers)) out[k] = v;
    Object.assign(out, CORS);
    res.writeHead(proxyRes.statusCode, out);
    proxyRes.pipe(res);
  });
  proxyReq.on('error', (e) => {
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'application/json', ...CORS });
    res.end(JSON.stringify({ error: 'proxy error', message: String((e && e.message) || e) }));
  });
  req.pipe(proxyReq);
});

server.listen(PORT, () => console.log('proxy listening on ' + PORT + ' -> ' + ORIGIN));
