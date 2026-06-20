import fs from 'fs';
import path from 'path';

const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
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

const legacyPrefixes = ['/services', '/industry', '/privacy-terms'];

function resolveLegacyPath(urlPath, root) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  let relative = decoded.replace(/^\//, '') || 'index.html';

  if (relative.endsWith('/')) {
    const withoutSlash = relative.slice(0, -1);
    const htmlFile = path.join(root, `${withoutSlash}.html`);
    if (fs.existsSync(htmlFile) && fs.statSync(htmlFile).isFile()) {
      return htmlFile;
    }
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

function isLegacyRequest(urlPath) {
  if (legacyPrefixes.some((prefix) => urlPath === prefix || urlPath.startsWith(`${prefix}/`))) {
    return true;
  }

  const rootPages = ['/index.html', '/services.html', '/industry.html'];
  return rootPages.includes(urlPath);
}

/** Vite plugin: serve legacy static HTML (services/, industry/, etc.) during astro dev. */
export function legacyStaticPlugin(rootDir) {
  const handler = createLegacyHandler(rootDir);

  return {
    name: 'legacy-static',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use(handler);
    },
  };
}

/** Astro integration hook (runs early in dev server). */
export function legacyStaticIntegration(rootDir) {
  const handler = createLegacyHandler(rootDir);

  return {
    name: 'legacy-static',
    hooks: {
      'astro:server:setup': ({ server }) => {
        server.middlewares.use(handler);
      },
    },
  };
}

function createLegacyHandler(rootDir) {
  return (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();

    const urlPath = (req.url || '/').split('?')[0];
    if (!isLegacyRequest(urlPath)) return next();

    const filePath = resolveLegacyPath(urlPath, rootDir);
    if (!filePath) return next();

    const ext = path.extname(filePath).toLowerCase();
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.end(fs.readFileSync(filePath));
  };
}
