import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123456', 10);

  await prisma.user.upsert({
    where: { email: 'admin@archuramedia.com' },
    update: {},
    create: {
      email: 'admin@archuramedia.com',
      passwordHash,
      name: 'Admin',
      role: 'admin',
    },
  });

  const authors = await Promise.all([
    prisma.author.upsert({
      where: { slug: 'sarah-johnson' },
      update: {},
      create: {
        name: 'Sarah Johnson',
        slug: 'sarah-johnson',
        title: 'SEO Specialist',
        bio: '<p>Sarah leads SEO strategy at Archura Media with 8+ years of experience in organic growth.</p>',
        socialLinks: [
          { platform: 'linkedin', url: 'https://linkedin.com/in/sarahjohnson' },
          { platform: 'twitter', url: 'https://twitter.com/sarahjohnson' },
        ],
        seoMetaTitle: 'Sarah Johnson | Archura Media Author',
        seoMetaDescription: 'Read articles by Sarah Johnson, SEO Specialist at Archura Media.',
      },
    }),
    prisma.author.upsert({
      where: { slug: 'michael-chen' },
      update: {},
      create: {
        name: 'Michael Chen',
        slug: 'michael-chen',
        title: 'Content Marketing Lead',
        bio: '<p>Michael crafts data-driven content strategies for B2B and SaaS brands.</p>',
        socialLinks: [{ platform: 'linkedin', url: 'https://linkedin.com/in/michaelchen' }],
        seoMetaTitle: 'Michael Chen | Archura Media Author',
        seoMetaDescription: 'Articles by Michael Chen on content marketing and growth.',
      },
    }),
  ]);

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'seo' },
      update: {},
      create: {
        name: 'SEO',
        slug: 'seo',
        description: 'Search engine optimization tips, guides, and industry insights.',
        seoMetaTitle: 'SEO Blog | Archura Media',
        seoMetaDescription: 'Expert SEO articles from Archura Media.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'content-marketing' },
      update: {},
      create: {
        name: 'Content Marketing',
        slug: 'content-marketing',
        description: 'Content strategy, copywriting, and distribution tactics.',
        seoMetaTitle: 'Content Marketing Blog | Archura Media',
        seoMetaDescription: 'Content marketing insights from Archura Media experts.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ppc' },
      update: {},
      create: {
        name: 'PPC',
        slug: 'ppc',
        description: 'Paid media strategies and campaign optimization.',
        seoMetaTitle: 'PPC Blog | Archura Media',
        seoMetaDescription: 'PPC advertising tips and best practices.',
      },
    }),
  ]);

  const posts = [
    {
      title: '10 SEO Trends to Watch in 2025',
      slug: '10-seo-trends-2025',
      excerpt: 'Stay ahead of the curve with these emerging SEO trends.',
      content:
        '<h2>Introduction</h2><p>Search engines continue to evolve rapidly. Here are the top trends shaping SEO in 2025.</p><h2>AI-Powered Search</h2><p>Generative AI is changing how users discover content. Optimize for conversational queries and featured snippets.</p><h2>Core Web Vitals</h2><p>Page experience signals remain critical for rankings. Focus on LCP, INP, and CLS.</p>',
      authorId: authors[0].id,
      categoryId: categories[0].id,
    },
    {
      title: 'How to Build a Content Calendar That Converts',
      slug: 'content-calendar-that-converts',
      excerpt: 'A practical guide to planning content that drives business results.',
      content:
        '<h2>Why a Content Calendar Matters</h2><p>Consistency is the foundation of content marketing success.</p><h2>Mapping to Funnel Stages</h2><p>Align each piece of content with awareness, consideration, or decision stages.</p>',
      authorId: authors[1].id,
      categoryId: categories[1].id,
    },
    {
      title: 'Google Ads Quality Score Explained',
      slug: 'google-ads-quality-score',
      excerpt: 'Understand Quality Score and improve your PPC campaign performance.',
      content:
        '<h2>What Is Quality Score?</h2><p>Quality Score is Google\'s rating of ad relevance and landing page experience.</p><h2>How to Improve It</h2><p>Focus on keyword-ad alignment, compelling ad copy, and fast landing pages.</p>',
      authorId: authors[0].id,
      categoryId: categories[2].id,
    },
    {
      title: 'Technical SEO Audit Checklist',
      slug: 'technical-seo-audit-checklist',
      excerpt: 'A step-by-step checklist for comprehensive technical SEO audits.',
      content:
        '<h2>Crawlability</h2><p>Ensure search engines can access and index your important pages.</p><h2>Site Architecture</h2><p>Logical URL structure and internal linking boost discoverability.</p>',
      authorId: authors[0].id,
      categoryId: categories[0].id,
    },
    {
      title: 'Storytelling in B2B Content',
      slug: 'storytelling-b2b-content',
      excerpt: 'Use narrative techniques to make B2B content more engaging.',
      content:
        '<h2>The Power of Story</h2><p>Even B2B buyers respond to compelling narratives.</p><h2>Case Study Framework</h2><p>Structure stories around challenge, solution, and measurable results.</p>',
      authorId: authors[1].id,
      categoryId: categories[1].id,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        status: 'published',
        publishedAt: new Date(),
        seoMetaTitle: `${post.title} | Archura Media Blog`,
        seoMetaDescription: post.excerpt,
      },
    });
  }

  const sarahAuthor = authors.find((a) => a.slug === 'sarah-johnson');
  if (sarahAuthor) {
    await prisma.user.upsert({
      where: { email: 'sarah@archuramedia.com' },
      update: { authorId: sarahAuthor.id, role: 'author' },
      create: {
        email: 'sarah@archuramedia.com',
        passwordHash: await bcrypt.hash('author123456', 10),
        name: 'Sarah Johnson',
        role: 'author',
        authorId: sarahAuthor.id,
      },
    });
  }

  console.log('Seed completed: admin@archuramedia.com / admin123456');
  console.log('Author login: sarah@archuramedia.com / author123456');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
