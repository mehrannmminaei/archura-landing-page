# Archura Media — Monorepo

Marketing site (Astro), blog CMS API (Express + Prisma), and admin panel (React) in one repository. All content is stored in **PostgreSQL via Docker**.

## Structure

```
blog/
├── api/              # CMS API + Prisma (admin CRUD, uploads)
├── admin/            # Admin panel (React + Vite)
├── src/              # Astro site (reads directly from PostgreSQL at build time)
├── docker-compose.yml
└── .env.example      # Database + API config
```

## Quick Start

### 1. PostgreSQL (Docker)

```bash
docker compose up -d
```

### 2. Install & configure

```bash
npm install
cp .env.example api/.env
npm run db:setup
```

Both Astro build and the CMS API use `api/.env` → Docker PostgreSQL at `localhost:5432`.

### 3. Development

```bash
# Terminal 1 — CMS API + admin
npm run dev:cms

# Terminal 2 — Astro site (reads from Docker DB directly)
npm run dev
```

- **Site**: http://localhost:4321
- **Admin (dev)**: http://localhost:5173/admin/
- **API**: http://localhost:4000

**Default login:** `admin@archuramedia.com` / `admin123456`

### 4. Production-like local run

```bash
npm run build:cms
npm run start:api
npm run build:site && npm run serve
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Astro dev server |
| `npm run dev:cms` | API + admin dev servers |
| `npm run build:site` | Build static site from Docker DB → `dist/` |
| `npm run build:cms` | Build admin panel + API |
| `npm run build:all` | Build CMS + site |
| `npm run db:setup` | Push schema + seed data |

## Deploy (Docker — self-hosted)

Full stack on your server: PostgreSQL, CMS API + admin, and static site behind nginx.

### 1. Configure

```bash
cp .env.production.example .env
# Edit .env — set SITE_URL, PUBLIC_URL, POSTGRES_PASSWORD, JWT_SECRET
```

### 2. Start

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Or: `npm run docker:prod`

- **Site**: `http://YOUR_SERVER/` (port 80 by default, set `HTTP_PORT` in `.env`)
- **Admin**: `http://YOUR_SERVER/admin/`
- **API**: `http://YOUR_SERVER/api/`

Default login (when `SEED_ON_START=true`): `admin@archuramedia.com` / `admin123456`

### 3. After CMS content changes

Publishing, updating, or unpublishing a post in `/admin/` **automatically rebuilds** the static site (API → web rebuild server).

Manual rebuild if needed:

```bash
docker compose -f docker-compose.prod.yml exec web /docker/build-site.sh
docker compose -f docker-compose.prod.yml exec web nginx -s reload
```

Or: `npm run docker:rebuild-site`

Test webhook manually:

```bash
curl -X POST -H "x-webhook-secret: YOUR_WEBHOOK_SECRET" http://localhost/api/webhook/publish
```

### 4. HTTPS (recommended)

Put Caddy, Traefik, or nginx on the host in front of port 80, or terminate TLS at your load balancer.

### Services

| Service | Role |
|---------|------|
| `postgres` | Database (internal only, not exposed) |
| `api` | CMS API, admin panel, uploads |
| `web` | Builds Astro site at startup, serves via nginx |

## Deploy (FTP)

GitHub Actions builds Astro directly from PostgreSQL (no external CMS URL).

For CI, either:
- use the bundled Postgres service (empty until you migrate data), or
- set a `DATABASE_URL` secret pointing to your production database

Required FTP secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`

Optional: `DATABASE_URL` — production PostgreSQL connection string

## Blog Pages

Generated at build time from PostgreSQL:

- `/blog/` — post listing
- `/blog/{slug}/` — single post
- `/blog/category/{slug}/` — category archive
- `/blog/author/{slug}/` — author archive
