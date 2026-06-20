import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { routeParam } from '../lib/param.js';
import { authRequired, requireRole, signToken } from '../middleware/auth.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function userPayload(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  authorId: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    authorId: user.authorId,
  };
}

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const payload = userPayload(user);
  const token = signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    authorId: user.authorId,
  });
  res.json({ token, user: payload });
});

router.get('/me', authRequired, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      authorId: true,
      author: { select: { id: true, name: true, slug: true } },
    },
  });
  res.json(user);
});

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['admin', 'author', 'editor']).optional(),
  authorId: z.string().optional().nullable(),
});

function toUserRole(role: string): UserRole {
  if (role === 'admin') return UserRole.admin;
  if (role === 'editor') return UserRole.editor;
  return UserRole.author;
}

function isAuthorLikeRole(role: UserRole): boolean {
  return role === UserRole.author || role === UserRole.editor;
}

router.get('/users', authRequired, requireRole('admin'), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      authorId: true,
      createdAt: true,
      author: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

router.post('/users', authRequired, requireRole('admin'), async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const role = toUserRole(parsed.data.role ?? 'author');
  if (isAuthorLikeRole(role) && !parsed.data.authorId) {
    res.status(400).json({ error: 'Author profile is required for author role' });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
      role,
      authorId: isAuthorLikeRole(role) ? parsed.data.authorId! : null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      authorId: true,
      author: { select: { name: true, slug: true } },
    },
  });

  res.status(201).json(user);
});

router.delete('/users/:id', authRequired, requireRole('admin'), async (req, res) => {
  if (req.user!.id === routeParam(req.params.id)) {
    res.status(400).json({ error: 'Cannot delete your own account' });
    return;
  }
  await prisma.user.delete({ where: { id: routeParam(req.params.id) } });
  res.status(204).send();
});

export default router;
