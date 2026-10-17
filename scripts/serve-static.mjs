// Tiny static file server for the exported site in ./out (used by Playwright E2E).
// Works on Windows, macOS and Linux with no extra packages.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve('out');
const port = Number(process.env.PORT ?? 3100);
const host = process.env.HOST ?? '0.0.0.0';
const basePath = (process.env.BASE_PATH ?? '').replace(/\/$/, '');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.map': 'application/json',
};

async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const candidates = [join(root, clean)];
  if (urlPath.endsWith('/')) candidates.push(join(root, clean, 'index.html'));
  else candidates.push(join(root, clean + '.html'), join(root, clean, 'index.html'));
  for (const c of candidates) {
    if (!c.startsWith(root)) continue;
    try {
      const s = await stat(c);
      if (s.isFile()) return c;
    } catch { /* try next */ }
  }
  return null;
}

const server = createServer(async (req, res) => {
  let url = req.url ?? '/';
  if (basePath) {
    if (url === basePath) { res.writeHead(301, { Location: basePath + '/' }); return res.end(); }
    if (url.startsWith(basePath + '/')) url = url.slice(basePath.length);
    else { res.writeHead(404); return res.end('Not found'); }
  }
  const file = await resolveFile(url);
  if (file) {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    return res.end(body);
  }
  const notFound = await readFile(join(root, '404.html')).catch(() => Buffer.from('Not found'));
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(notFound);
});

server.listen(port, host, () => console.log(`Serving ${root} at http://${host}:${port}${basePath}/`));
