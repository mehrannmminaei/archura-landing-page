import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_URL = process.env.PUBLIC_CMS_API_URL || 'http://localhost:4000';
const SITE_URL = process.env.SITE_URL || 'https://www.archuramedia.com';
const root = path.dirname(fileURLToPath(import.meta.url));

async function fetchSlugs(endpoint) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const staticUrls = [
  '',
  'services.html',
  'industry.html',
  'blog/',
];

const [posts, categories, authors] = await Promise.all([
  fetchSlugs('/api/posts?status=published'),
  fetchSlugs('/api/categories'),
  fetchSlugs('/api/authors'),
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
console.log(`Generated sitemap with ${urls.length} URLs`);
