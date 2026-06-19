const API_URL = import.meta.env.PUBLIC_CMS_API_URL || 'http://localhost:4000';

export interface Media {
  id: string;
  url: string;
  alt: string | null;
  type: 'image' | 'video';
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  bio: string | null;
  avatar: Media | null;
  socialLinks: { platform: string; url: string }[] | null;
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImage: Media | null;
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
  seoOgImage: Media | null;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  coverImage: Media | null;
  author: Author;
  category: Category;
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
  seoOgTitle: string | null;
  seoOgDescription: string | null;
  seoOgImage: Media | null;
  seoCanonicalUrl: string | null;
  seoJsonLd: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status} ${path}`);
  return res.json() as Promise<T>;
}

export async function getPublishedPosts(): Promise<Post[]> {
  return fetchJson<Post[]>('/api/posts?status=published');
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const post = await fetchJson<Post>(`/api/posts/${slug}`);
    return post.status === 'published' ? post : null;
  } catch {
    return null;
  }
}

export async function getRelatedPosts(slug: string): Promise<Post[]> {
  try {
    return fetchJson<Post[]>(`/api/posts/${slug}/related`);
  } catch {
    return [];
  }
}

export async function getAuthor(slug: string): Promise<(Author & { posts?: Post[] }) | null> {
  try {
    return fetchJson(`/api/authors/${slug}`);
  } catch {
    return null;
  }
}

export async function getCategory(slug: string): Promise<(Category & { posts?: Post[] }) | null> {
  try {
    return fetchJson(`/api/categories/${slug}`);
  } catch {
    return null;
  }
}

export function formatDate(date: string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}
