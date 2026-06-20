import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  disconnectDb,
  getAuthors,
  getCategories,
  getPublishedPosts,
} from '../api/src/lib/cms-data.js';

const SITE_URL = process.env.SITE_URL || 'https://www.archuramedia.com';
const root = path.dirname(fileURLToPath(import.meta.url));

const staticUrls = ['', 'services.html', 'industry.html', 'blog/'];

const [posts, categories, authors] = await Promise.all([
  getPublishedPosts(),
  getCategories(),
  getAuthors(),
]);

const urls = [
  ...staticUrls.map((p) => `${SITE_URL}/${p}`),
  ...posts.map((p) => `${SITE_URL}/blog/${p.slug}/`),
  ...categories.map((c) => `${SITE_URL}/blog/category/${c.slug}/`),
  ...authors.map((a) => `${SITE_URL}/blog/author/${a.slug}/`),
];

const today = new Date().toISOString().split('T')[0];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(root, '..', 'sitemap-blog.xml'), xml);
await disconnectDb();
console.log(`Generated sitemap with ${urls.length} URLs`);
