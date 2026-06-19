import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(root, '..', 'dist', 'blog');
const dest = path.join(root, '..', 'blog');

if (!fs.existsSync(src)) {
  console.error('Run "npm run build" first — dist/blog/ not found.');
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log('Copied dist/blog/ → blog/ (static pages ready for local server)');
