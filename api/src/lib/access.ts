import type { Response } from 'express';
import type { AuthUser } from '../middleware/auth.js';
import { prisma } from './prisma.js';

import type { UserRole } from '@prisma/client';

export function isAuthorRole(user: { role: UserRole }): boolean {
  return user.role === 'author' || user.role === 'editor';
}

export async function assertCanEditPost(user: AuthUser, postId: string, res: Response): Promise<boolean> {
  if (user.role === 'admin') return true;

  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return false;
  }

  if (!user.authorId || post.authorId !== user.authorId) {
    res.status(403).json({ error: 'You can only edit your own posts' });
    return false;
  }

  return true;
}

export function authorPostFilter(user: { role: UserRole; authorId?: string | null }): { authorId?: string } {
  if (user.role === 'admin') return {};
  if (user.authorId) return { authorId: user.authorId };
  return { authorId: '__none__' };
}
