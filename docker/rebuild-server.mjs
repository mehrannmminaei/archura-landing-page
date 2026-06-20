import http from 'http';
import { spawn } from 'child_process';

const port = Number(process.env.REBUILD_PORT) || 3001;
const secret = process.env.WEBHOOK_SECRET;

let building = false;
let queued = false;

function reloadNginx() {
  spawn('nginx', ['-s', 'reload'], { stdio: 'inherit' });
}

function runBuild() {
  if (building) {
    queued = true;
    return;
  }

  building = true;
  console.log('[rebuild-server] starting site build...');

  const proc = spawn('/docker/build-site.sh', [], { stdio: 'inherit' });

  proc.on('close', (code) => {
    building = false;
    if (code === 0) {
      console.log('[rebuild-server] build complete, reloading nginx');
      reloadNginx();
    } else {
      console.error(`[rebuild-server] build failed with code ${code}`);
    }

    if (queued) {
      queued = false;
      runBuild();
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', building }));
    return;
  }

  if (req.method !== 'POST' || req.url !== '/rebuild') {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  if (!secret || req.headers['x-webhook-secret'] !== secret) {
    res.writeHead(401, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }

  res.writeHead(202, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ ok: true, message: 'Rebuild started', building }));

  runBuild();
});

server.listen(port, () => {
  console.log(`[rebuild-server] listening on :${port}`);
});
