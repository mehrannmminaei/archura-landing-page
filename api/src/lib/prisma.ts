import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const includePost = {
  author: { include: { avatar: true } },
  category: { include: { coverImage: true, seoOgImage: true } },
  coverImage: true,
  seoOgImage: true,
} as const;

export const includeAuthor = {
  avatar: true,
  _count: { select: { posts: true } },
} as const;

export const includeCategory = {
  coverImage: true,
  seoOgImage: true,
  _count: { select: { posts: true } },
} as const;
