export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'author' | 'editor';
  authorId?: string | null;
  author?: { id: string; name: string; slug: string } | null;
  createdAt?: string;
}

export interface Media {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  type: 'image' | 'video';
  alt: string | null;
  size: number;
  createdAt: string;
}

export interface Author {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  bio: string | null;
  avatarId: string | null;
  avatar: Media | null;
  socialLinks: { platform: string; url: string }[] | null;
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
  _count?: { posts: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  coverImageId: string | null;
  coverImage: Media | null;
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
  seoOgImageId: string | null;
  seoOgImage: Media | null;
  _count?: { posts: number };
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: 'draft' | 'published';
  publishedAt: string | null;
  coverImageId: string | null;
  coverImage: Media | null;
  authorId: string;
  author: Author;
  categoryId: string;
  category: Category;
  seoMetaTitle: string | null;
  seoMetaDescription: string | null;
  seoOgTitle: string | null;
  seoOgDescription: string | null;
  seoOgImageId: string | null;
  seoOgImage: Media | null;
  seoCanonicalUrl: string | null;
  seoJsonLd: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  stats: {
    postsTotal: number;
    authorsTotal: number;
    categoriesTotal: number;
    draftCount: number;
    publishedCount: number;
  };
  recentPosts: Post[];
}
