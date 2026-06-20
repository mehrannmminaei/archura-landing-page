import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma, includeAuthor, includeCategory, includePost } from '../lib/prisma.js';
import { toSlug, uniqueSlug } from '../lib/slug.js';
import { assertCanEditPost, authorPostFilter, isAuthorRole } from '../lib/access.js';
import { routeParam } from '../lib/param.js';
import { buildPostJsonLd, type PostJsonLdInput } from '../lib/postJsonLd.js';
import { authRequired, optionalAuth, requireRole } from '../middleware/auth.js';
import { mediaTypeFromMime, publicMediaUrl, upload } from '../middleware/upload.js';
import { scheduleSiteRebuild, shouldRebuildForPostChange } from '../lib/site-rebuild.js';

const router = Router();

const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
});

const authorSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  avatarId: z.string().optional().nullable(),
  socialLinks: z.array(socialLinkSchema).optional(),
  seoMetaTitle: z.string().optional(),
  seoMetaDescription: z.string().optional(),
});

router.get('/authors', async (_req, res) => {
  const authors = await prisma.author.findMany({
    include: includeAuthor,
    orderBy: { name: 'asc' },
  });
  res.json(authors);
});

router.get('/authors/:slug', async (req, res) => {
  const author = await prisma.author.findUnique({
    where: { slug: routeParam(req.params.slug) },
    include: {
      ...includeAuthor,
      posts: {
        where: { status: 'published' },
        include: includePost,
        orderBy: { publishedAt: 'desc' },
      },
    },
  });
  if (!author) {
    res.status(404).json({ error: 'Author not found' });
    return;
  }
  res.json(author);
});

router.post('/authors', authRequired, requireRole('admin'), async (req, res) => {
  const parsed = authorSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.author.findMany({ select: { slug: true } });
  const slug = parsed.data.slug
    ? toSlug(parsed.data.slug)
    : uniqueSlug(
        parsed.data.name,
        existing.map((a) => a.slug),
      );

  const author = await prisma.author.create({
    data: {
      name: parsed.data.name,
      slug,
      title: parsed.data.title,
      bio: parsed.data.bio,
      avatarId: parsed.data.avatarId ?? null,
      socialLinks: parsed.data.socialLinks ?? [],
      seoMetaTitle: parsed.data.seoMetaTitle,
      seoMetaDescription: parsed.data.seoMetaDescription,
    },
    include: includeAuthor,
  });

  res.status(201).json(author);
});

router.put('/authors/:id', authRequired, requireRole('admin'), async (req, res) => {
  const parsed = authorSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const author = await prisma.author.update({
    where: { id: routeParam(req.params.id) },
    data: {
      ...parsed.data,
      slug: parsed.data.slug ? toSlug(parsed.data.slug) : undefined,
    },
    include: includeAuthor,
  });

  res.json(author);
});

router.delete('/authors/:id', authRequired, requireRole('admin'), async (req, res) => {
  await prisma.author.delete({ where: { id: routeParam(req.params.id) } });
  res.status(204).send();
});

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  coverImageId: z.string().optional().nullable(),
  seoMetaTitle: z.string().optional(),
  seoMetaDescription: z.string().optional(),
  seoOgImageId: z.string().optional().nullable(),
});

router.get('/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: includeCategory,
    orderBy: { name: 'asc' },
  });
  res.json(categories);
});

router.get('/categories/:slug', async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { slug: routeParam(req.params.slug) },
    include: {
      ...includeCategory,
      posts: {
        where: { status: 'published' },
        include: includePost,
        orderBy: { publishedAt: 'desc' },
      },
    },
  });
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json(category);
});

router.post('/categories', authRequired, requireRole('admin'), async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await prisma.category.findMany({ select: { slug: true } });
  const slug = parsed.data.slug
    ? toSlug(parsed.data.slug)
    : uniqueSlug(
        parsed.data.name,
        existing.map((c) => c.slug),
      );

  const category = await prisma.category.create({
    data: { ...parsed.data, slug },
    include: includeCategory,
  });

  res.status(201).json(category);
});

router.put('/categories/:id', authRequired, requireRole('admin'), async (req, res) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const category = await prisma.category.update({
    where: { id: routeParam(req.params.id) },
    data: {
      ...parsed.data,
      slug: parsed.data.slug ? toSlug(parsed.data.slug) : undefined,
    },
    include: includeCategory,
  });

  res.json(category);
});

router.delete('/categories/:id', authRequired, requireRole('admin'), async (req, res) => {
  await prisma.category.delete({ where: { id: routeParam(req.params.id) } });
  res.status(204).send();
});

const postSchema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  status: z.enum(['draft', 'published']).optional(),
  coverImageId: z.string().optional().nullable(),
  authorId: z.string(),
  categoryId: z.string(),
  seoMetaTitle: z.string().optional(),
  seoMetaDescription: z.string().optional(),
  seoOgTitle: z.string().optional(),
  seoOgDescription: z.string().optional(),
  seoOgImageId: z.string().optional().nullable(),
  seoCanonicalUrl: z.string().url().optional().or(z.literal('')),
});

function attachPostJsonLd<T extends Record<string, unknown>>(post: T): T & { seoJsonLd: Record<string, unknown> } {
  const jsonLd =
    (post.seoJsonLd as Record<string, unknown> | null) ||
    buildPostJsonLd(post as unknown as PostJsonLdInput);
  return { ...post, seoJsonLd: jsonLd };
}

router.get('/posts', optionalAuth, async (req, res) => {
  const status = req.query.status as string | undefined;
  const categorySlug = req.query.category as string | undefined;
  const authorSlug = req.query.author as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const panelFilter = req.user ? authorPostFilter(req.user) : {};

  const posts = await prisma.post.findMany({
    where: {
      ...panelFilter,
      ...(status ? { status: status as 'draft' | 'published' } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(authorSlug ? { author: { slug: authorSlug } } : {}),
    },
    include: includePost,
    orderBy: { publishedAt: 'desc' },
    ...(limit ? { take: limit } : {}),
  });

  res.json(posts.map(attachPostJsonLd));
});

router.get('/posts/:slug', async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { slug: routeParam(req.params.slug) },
    include: includePost,
  });
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  if (!post || post.status !== 'published') {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  res.json(attachPostJsonLd(post));
});

router.get('/posts/:slug/related', async (req, res) => {
  const post = await prisma.post.findUnique({ where: { slug: routeParam(req.params.slug) } });
  if (!post || post.status !== 'published') {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

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

  res.json(related);
});

router.post('/posts', authRequired, async (req, res) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const authorId = isAuthorRole(req.user!) ? req.user!.authorId : parsed.data.authorId;

  if (!authorId) {
    res.status(400).json({ error: 'Author profile is required' });
    return;
  }

  if (isAuthorRole(req.user!) && parsed.data.authorId && parsed.data.authorId !== req.user!.authorId) {
    res.status(403).json({ error: 'You can only create posts under your author profile' });
    return;
  }

  const existing = await prisma.post.findMany({ select: { slug: true } });
  const slug = parsed.data.slug
    ? toSlug(parsed.data.slug)
    : uniqueSlug(
        parsed.data.title,
        existing.map((p) => p.slug),
      );

  const status = parsed.data.status ?? 'draft';
  const publishedAt = status === 'published' ? new Date() : null;

  const postData = {
    title: parsed.data.title,
    slug,
    excerpt: parsed.data.excerpt,
    content: parsed.data.content,
    status,
    publishedAt,
    coverImageId: parsed.data.coverImageId ?? null,
    authorId,
    categoryId: parsed.data.categoryId,
    seoMetaTitle: parsed.data.seoMetaTitle,
    seoMetaDescription: parsed.data.seoMetaDescription,
    seoOgTitle: parsed.data.seoOgTitle,
    seoOgDescription: parsed.data.seoOgDescription,
    seoOgImageId: parsed.data.seoOgImageId ?? null,
    seoCanonicalUrl: parsed.data.seoCanonicalUrl || null,
  };

  const post = await prisma.post.create({
    data: postData,
    include: includePost,
  });

  const withJsonLd = await prisma.post.update({
    where: { id: post.id },
    data: {
      seoJsonLd: buildPostJsonLd({
        ...post,
        author: post.author,
        seoOgImage: post.seoOgImage,
        coverImage: post.coverImage,
      }) as Prisma.InputJsonValue,
    },
    include: includePost,
  });

  res.status(201).json(attachPostJsonLd(withJsonLd));

  if (status === 'published') {
    scheduleSiteRebuild('post-created');
  }
});

router.put('/posts/:id', authRequired, async (req, res) => {
  const parsed = postSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const current = await prisma.post.findUnique({ where: { id: routeParam(req.params.id) } });
  if (!current) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  if (!(await assertCanEditPost(req.user!, routeParam(req.params.id), res))) return;

  if (isAuthorRole(req.user!) && parsed.data.authorId && parsed.data.authorId !== req.user!.authorId) {
    res.status(403).json({ error: 'You cannot change the author of a post' });
    return;
  }

  const status = parsed.data.status ?? current.status;
  let publishedAt = current.publishedAt;
  if (status === 'published' && !current.publishedAt) {
    publishedAt = new Date();
  }

  const merged = {
    ...current,
    ...parsed.data,
    status,
    publishedAt,
    authorId: isAuthorRole(req.user!) ? req.user!.authorId! : parsed.data.authorId ?? current.authorId,
    slug: parsed.data.slug ? toSlug(parsed.data.slug) : current.slug,
    seoCanonicalUrl:
      parsed.data.seoCanonicalUrl === '' ? null : parsed.data.seoCanonicalUrl ?? current.seoCanonicalUrl,
  };

  const author = await prisma.author.findUniqueOrThrow({ where: { id: merged.authorId } });
  const coverImage = merged.coverImageId
    ? await prisma.media.findUnique({ where: { id: merged.coverImageId } })
    : null;
  const seoOgImage = merged.seoOgImageId
    ? await prisma.media.findUnique({ where: { id: merged.seoOgImageId } })
    : null;

  const post = await prisma.post.update({
    where: { id: routeParam(req.params.id) },
    data: {
      title: merged.title,
      slug: merged.slug,
      excerpt: merged.excerpt,
      content: merged.content,
      status: merged.status,
      publishedAt: merged.publishedAt,
      coverImageId: merged.coverImageId,
      authorId: merged.authorId,
      categoryId: merged.categoryId,
      seoMetaTitle: merged.seoMetaTitle,
      seoMetaDescription: merged.seoMetaDescription,
      seoOgTitle: merged.seoOgTitle,
      seoOgDescription: merged.seoOgDescription,
      seoOgImageId: merged.seoOgImageId,
      seoCanonicalUrl: merged.seoCanonicalUrl,
      seoJsonLd: buildPostJsonLd({
        title: merged.title,
        slug: merged.slug,
        excerpt: merged.excerpt,
        seoMetaTitle: merged.seoMetaTitle,
        seoMetaDescription: merged.seoMetaDescription,
        seoCanonicalUrl: merged.seoCanonicalUrl,
        seoOgImage,
        coverImage,
        publishedAt: merged.publishedAt,
        updatedAt: new Date(),
        author,
      }) as Prisma.InputJsonValue,
    },
    include: includePost,
  });

  res.json(attachPostJsonLd(post));

  if (shouldRebuildForPostChange(current.status, merged.status)) {
    scheduleSiteRebuild('post-updated');
  }
});

router.delete('/posts/:id', authRequired, async (req, res) => {
  const current = await prisma.post.findUnique({ where: { id: routeParam(req.params.id) } });
  if (!current) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  if (!(await assertCanEditPost(req.user!, routeParam(req.params.id), res))) return;

  await prisma.post.delete({ where: { id: routeParam(req.params.id) } });
  res.status(204).send();

  if (current.status === 'published') {
    scheduleSiteRebuild('post-deleted');
  }
});

router.get('/media', authRequired, async (req, res) => {
  const type = req.query.type as string | undefined;
  const media = await prisma.media.findMany({
    where: type ? { type: type as 'image' | 'video' } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  res.json(media);
});

router.post('/media', authRequired, upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const media = await prisma.media.create({
    data: {
      filename: req.file.filename,
      url: publicMediaUrl(req.file.filename),
      mimeType: req.file.mimetype,
      type: mediaTypeFromMime(req.file.mimetype),
      alt: (req.body.alt as string) || null,
      size: req.file.size,
    },
  });

  res.status(201).json(media);
});

router.delete('/media/:id', authRequired, requireRole('admin'), async (req, res) => {
  await prisma.media.delete({ where: { id: routeParam(req.params.id) } });
  res.status(204).send();
});

router.get('/dashboard', authRequired, async (req, res) => {
  const postFilter = authorPostFilter(req.user!);

  const [postsTotal, authorsTotal, categoriesTotal, draftCount, publishedCount, recentPosts] =
    await Promise.all([
      prisma.post.count({ where: postFilter }),
      req.user!.role === 'admin' ? prisma.author.count() : Promise.resolve(1),
      req.user!.role === 'admin' ? prisma.category.count() : Promise.resolve(0),
      prisma.post.count({ where: { ...postFilter, status: 'draft' } }),
      prisma.post.count({ where: { ...postFilter, status: 'published' } }),
      prisma.post.findMany({
        where: postFilter,
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: includePost,
      }),
    ]);

  res.json({
    stats: { postsTotal, authorsTotal, categoriesTotal, draftCount, publishedCount },
    recentPosts,
  });
});

router.post('/webhook/publish', async (req, res) => {
  const headerSecret = req.headers['x-webhook-secret'];
  if (headerSecret !== process.env.WEBHOOK_SECRET) {
    res.status(401).json({ error: 'Invalid webhook secret' });
    return;
  }

  scheduleSiteRebuild('webhook');
  res.json({ ok: true, message: 'Site rebuild started' });
});

export default router;
