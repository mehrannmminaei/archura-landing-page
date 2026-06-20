import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const distOnly = process.argv.includes('--dist');
const base = distOnly ? path.join(root, 'dist') : root;

const SERVICE_PAGES = [
  'Analytics',
  'ConsultationServices',
  'ContentMarketing',
  'ConversionRateOptimization',
  'DomainTrademark',
  'EmailMarketing',
  'GreyHat',
  'LandingPageDesign',
  'PPCAdvertising',
  'RetentionMarketing',
  'SearchEngineOptimization',
  'WebsiteDesignDevelopment',
];

const INDUSTRY_PAGES = [
  'AI',
  'B2B',
  'Crypto',
  'EcommerceMarketingSolutions',
  'FintechMarketingSolutions',
  'SaaS',
  'SoftwareMarketingSolutions',
  'iGaming',
];

function fixContent(html, filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  const inServices = normalized.includes('/services/');
  const inIndustry = normalized.includes('/industry/');

  let result = html
    .replace(/\.\.\/styles\//g, '/styles/')
    .replace(/\.\.\/script\//g, '/script/')
    .replace(/href="\.\/styles\//g, 'href="/styles/')
    .replace(/src="\.\/script\//g, 'src="/script/')
    .replace(/src="script\//g, 'src="/script/')
    .replace(/href="favicon\.ico"/g, 'href="/favicon.ico"')
    .replace(/href="\.\.\/\.\.\/(services|industry|blog|privacy-terms)(\/[^"#]*)?"/g, 'href="/$1$2"')
    .replace(/href="\.\.\/(services|industry|blog|privacy-terms)(\/[^"#]*)?"/g, 'href="/$1$2"')
    .replace(/href="\.\.\/index\.html#([^"]+)"/g, 'href="/#$1"')
    .replace(/href="\.\.\/index#([^"]*)"/g, 'href="/#$1"')
    .replace(/href="index\.html#([^"]+)"/g, 'href="/#$1"')
    .replace(/href="\.\.\/index"/g, 'href="/"')
    .replace(/href="index\.html"/g, 'href="/"')
    .replace(/href="services\.html"/g, 'href="/services.html"')
    .replace(/href="industry\.html"/g, 'href="/industry.html"')
    .replace(/href="(services\/[^"#]+)"/g, 'href="/$1"')
    .replace(/href="(industry\/[^"#]+)"/g, 'href="/$1"')
    .replace(/href="(privacy-terms\/[^"#]+)"/g, 'href="/$1"')
    .replace(/href="blog\/"/g, 'href="/blog/"')
    .replace(/href="blog"/g, 'href="/blog/"')
    .replace(/href="services"/g, 'href="/services.html"')
    .replace(/href="industry"/g, 'href="/industry.html"');

  result = result.replace(/href="\.\/([^"/#?]+)"/g, (_match, page) => {
    if (inServices) return `href="/services/${page}"`;
    if (inIndustry) return `href="/industry/${page}"`;
    return `href="/${page}"`;
  });

  for (const page of SERVICE_PAGES) {
    result = result.replaceAll(`href="${page}"`, `href="/services/${page}"`);
  }

  for (const page of INDUSTRY_PAGES) {
    result = result.replaceAll(`href="${page}"`, `href="/industry/${page}"`);
  }

  return result;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = fixContent(content, filePath);
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed);
    console.log(`Fixed paths: ${path.relative(root, filePath)}`);
  }
}

function walkHtml(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (name.endsWith('.html')) processFile(full);
  }
}

for (const dir of ['services', 'industry', 'privacy-terms']) {
  walkHtml(path.join(base, dir));
}

for (const file of ['index.html', 'services.html', 'industry.html']) {
  const full = path.join(base, file);
  if (fs.existsSync(full)) processFile(full);
}
