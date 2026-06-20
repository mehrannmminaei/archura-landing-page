import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Prisma } from '@prisma/client';
import { prisma, includePost, includeAuthor, includeCategory } from './prisma.js';
import { buildPostJsonLd, type PostJsonLdInput } from './postJsonLd.js';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../.env') });

type PostRecord = Prisma.PostGetPayload<{ include: typeof includePost }>;
type AuthorRecord = Prisma.AuthorGetPayload<{ include: typeof includeAuthor }>;
type CategoryRecord = Prisma.CategoryGetPayload<{ include: typeof includeCategory }>;

function asSocialLinks(value: unknown): { platform: string; url: string }[] | null {
  if (!Array.isArray(value)) return null;
  return value as { platform: string; url: string }[];
}

function serializeMedia(media: PostRecord['coverImage']) {
  if (!media) return null;
  return {
    id: media.id,
    url: media.url,
    alt: media.alt,
    type: media.type,
  };
}

function serializeAuthor(author: PostRecord['author']) {
  return {
    id: author.id,
    name: author.name,
    slug: author.slug,
    title: author.title,
    bio: author.bio,
    avatar: serializeMedia(author.avatar),
    socialLinks: asSocialLinks(author.socialLinks),
    seoMetaTitle: author.seoMetaTitle,
    seoMetaDescription: author.seoMetaDescription,
    createdAt: author.createdAt.toISOString(),
    updatedAt: author.updatedAt.toISOString(),
  };
}

function serializeCategory(category: PostRecord['category']) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    coverImage: serializeMedia(category.coverImage),
    seoMetaTitle: category.seoMetaTitle,
    seoMetaDescription: category.seoMetaDescription,
    seoOgImage: serializeMedia(category.seoOgImage),
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

function attachPostJsonLd(post: PostRecord) {
  const jsonLd =
    (post.seoJsonLd as Record<string, unknown> | null) ||
    buildPostJsonLd(post as unknown as PostJsonLdInput);
  return { ...post, seoJsonLd: jsonLd };
}

function serializePost(post: PostRecord) {
  const withJsonLd = attachPostJsonLd(post);
  return {
    id: withJsonLd.id,
    title: withJsonLd.title,
    slug: withJsonLd.slug,
    excerpt: withJsonLd.excerpt,
    content: withJsonLd.content,
    status: withJsonLd.status,
    publishedAt: withJsonLd.publishedAt?.toISOString() ?? null,
    coverImage: serializeMedia(withJsonLd.coverImage),
    author: serializeAuthor(withJsonLd.author),
    category: serializeCategory(withJsonLd.category),
    seoMetaTitle: withJsonLd.seoMetaTitle,
    seoMetaDescription: withJsonLd.seoMetaDescription,
    seoOgTitle: withJsonLd.seoOgTitle,
    seoOgDescription: withJsonLd.seoOgDescription,
    seoOgImage: serializeMedia(withJsonLd.seoOgImage),
    seoCanonicalUrl: withJsonLd.seoCanonicalUrl,
    seoJsonLd: withJsonLd.seoJsonLd,
    createdAt: withJsonLd.createdAt.toISOString(),
    updatedAt: withJsonLd.updatedAt.toISOString(),
  };
}

export type SerializedPost = ReturnType<typeof serializePost>;
export type SerializedAuthor = ReturnType<typeof serializeAuthor>;
export type SerializedCategory = ReturnType<typeof serializeCategory>;

export async function getPublishedPosts(): Promise<SerializedPost[]> {
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    include: includePost,
    orderBy: { publishedAt: 'desc' },
  });
  return posts.map(serializePost);
}

export async function getPost(slug: string): Promise<SerializedPost | null> {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: includePost,
  });
  if (!post || post.status !== 'published') return null;
  return serializePost(post);
}

export async function getRelatedPosts(slug: string): Promise<SerializedPost[]> {
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.status !== 'published') return [];

  const related = await prisma.post.findMany({
    where: {
      categoryId: post.categoryId,
      status: 'published',
      id: { not: post.id },
    },
    include: includePost,
    orderBy: { publishedAt: 'desc' },
    take: 4,
  });

  return related.map(serializePost);
}

export async function getAuthors(): Promise<SerializedAuthor[]> {
  const authors = await prisma.author.findMany({
    include: includeAuthor,
    orderBy: { name: 'asc' },
  });
  return authors.map(serializeAuthor);
}

export async function getAuthor(slug: string): Promise<(SerializedAuthor & { posts: SerializedPost[] }) | null> {
  const author = await prisma.author.findUnique({
    where: { slug },
    include: {
      ...includeAuthor,
      posts: {
        where: { status: 'published' },
        include: includePost,
        orderBy: { publishedAt: 'desc' },
      },
    },
  });
  if (!author) return null;
  return {
    ...serializeAuthor(author),
    posts: author.posts.map(serializePost),
  };
}

export async function getCategories(): Promise<SerializedCategory[]> {
  const categories = await prisma.category.findMany({
    include: includeCategory,
    orderBy: { name: 'asc' },
  });
  return categories.map(serializeCategory);
}

export async function getCategory(
  slug: string,
): Promise<(SerializedCategory & { posts: SerializedPost[] }) | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      ...includeCategory,
      posts: {
        where: { status: 'published' },
        include: includePost,
        orderBy: { publishedAt: 'desc' },
      },
    },
  });
  if (!category) return null;
  return {
    ...serializeCategory(category),
    posts: category.posts.map(serializePost),
  };
}

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}
