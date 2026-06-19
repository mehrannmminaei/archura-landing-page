import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT) || 3000;

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = mime[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
}

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  let relative = decoded.replace(/^\//, '') || 'index.html';

  if (relative.endsWith('/')) {
    relative += 'index.html';
  }

  const filePath = path.join(root, relative);
  if (!filePath.startsWith(root)) return null;

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return filePath;
  }

  const withHtml = `${filePath}.html`;
  if (fs.existsSync(withHtml) && fs.statSync(withHtml).isFile()) {
    return withHtml;
  }

  const indexInDir = path.join(filePath, 'index.html');
  if (fs.existsSync(indexInDir) && fs.statSync(indexInDir).isFile()) {
    return indexInDir;
  }

  return null;
}

http
  .createServer((req, res) => {
    const file = resolvePath(req.url || '/');
    if (file) {
      sendFile(res, file);
    } else {
      res.writeHead(404);
      res.end(`Not found: ${req.url}`);
    }
  })
  .listen(port, () => {
    console.log(`Site running at http://localhost:${port}/`);
    console.log(`Blog at http://localhost:${port}/blog/`);
  });
