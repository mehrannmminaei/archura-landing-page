const SITE_URL = process.env.SITE_URL || 'https://www.archuramedia.com';
const SITE_NAME = 'Archura Media';

export type PostJsonLdInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  seoMetaTitle?: string | null;
  seoMetaDescription?: string | null;
  seoCanonicalUrl?: string | null;
  seoOgImage?: { url: string } | null;
  coverImage?: { url: string } | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string;
  author: { name: string; slug: string };
};

export function buildPostJsonLd(post: PostJsonLdInput): Record<string, unknown> {
  const siteUrl = SITE_URL.replace(/\/$/, '');
  const canonical = post.seoCanonicalUrl || `${siteUrl}/blog/${post.slug}/`;
  const description =
    post.seoMetaDescription || post.excerpt || post.title;
  const image = post.seoOgImage?.url || post.coverImage?.url || undefined;
  const datePublished = post.publishedAt
    ? new Date(post.publishedAt).toISOString()
    : undefined;
  const dateModified = post.updatedAt
    ? new Date(post.updatedAt).toISOString()
    : datePublished;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seoMetaTitle || post.title,
    name: post.title,
    description,
    ...(image ? { image: [image] } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: `${siteUrl}/blog/author/${post.author.slug}/`,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo-v3.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    url: canonical,
  };
}
