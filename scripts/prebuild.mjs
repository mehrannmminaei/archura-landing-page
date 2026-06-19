import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'public');

const copyItems = ['styles', 'script', 'favicon.ico', 'logo-v3.png', 'logo1.png', 'logo_.png'];

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

for (const item of copyItems) {
  const src = path.join(root, item);
  const dest = path.join(publicDir, item);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, dest, { recursive: true, force: true });
}

console.log('Prebuild: copied static assets to public/');
