import { defineConfig } from 'astro/config';

const apiUrl = process.env.PUBLIC_CMS_API_URL || 'http://localhost:4000';

export default defineConfig({
  site: process.env.SITE_URL || 'https://www.archuramedia.com',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  vite: {
    define: {
      'import.meta.env.PUBLIC_CMS_API_URL': JSON.stringify(apiUrl),
    },
  },
});
