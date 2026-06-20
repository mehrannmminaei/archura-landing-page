import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'astro/config';
import { legacyStaticIntegration } from './scripts/legacy-static.mjs';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: process.env.SITE_URL || 'https://www.archuramedia.com',
  trailingSlash: 'ignore',
  integrations: [legacyStaticIntegration(rootDir)],
  build: {
    format: 'directory',
  },
  vite: {
    ssr: {
      external: ['@prisma/client', '.prisma/client'],
    },
  },
});
