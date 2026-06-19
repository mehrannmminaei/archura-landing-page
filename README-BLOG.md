# Archura Media — Blog & Site

Marketing site with Astro-powered blog pages, fetching content from the Node.js CMS API.

## Blog Stack

- **Public site**: Astro SSG (this repo)
- **CMS API**: Node.js + Express + Prisma — see [`../blog-cms/`](../blog-cms/)
- **Admin panel**: React + Vite — see [`../blog-cms/admin/`](../blog-cms/admin/)

## Development

### 1. Start CMS API

```bash
cd ../blog-cms/api
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

### 2. Start Admin Panel (optional)

```bash
cd ../blog-cms/admin
npm install
npm run dev
```

Login: `admin@archuramedia.com` / `admin123456`

### 3. Build Blog Pages

```bash
npm install
PUBLIC_CMS_API_URL=http://localhost:4000 npm run build
npm run preview
```

Blog pages are generated at `/blog/`, `/blog/{slug}/`, `/blog/category/{slug}/`, `/blog/author/{slug}/`.

## Deploy

GitHub Actions workflow (`.github/workflows/deploy.yml`) builds Astro, merges legacy HTML pages, and deploys via FTP.

Required secrets: `CMS_API_URL`, `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`

## Blog Page Layout

Single post page order:
1. Cover image
2. Author + date (below image)
3. Title + content
4. Author widget
5. Related posts (same category)
