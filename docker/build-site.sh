#!/bin/sh
set -e

cd /app

echo "Building static site..."
node scripts/prebuild.mjs
npx astro build

echo "Merging legacy static pages..."
cp index.html services.html industry.html dist/ 2>/dev/null || true
cp -r services industry privacy-terms dist/ 2>/dev/null || true
cp -r styles script dist/ 2>/dev/null || true
cp robots.txt sitemap*.xml favicon.ico logo*.png dist/ 2>/dev/null || true

echo "Fixing legacy asset paths..."
node scripts/fix-legacy-asset-paths.mjs --dist

echo "Publishing site to nginx..."
mkdir -p /usr/share/nginx/html
rm -rf /usr/share/nginx/html/*
cp -r dist/* /usr/share/nginx/html/

echo "Site build complete."
