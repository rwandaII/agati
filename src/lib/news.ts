import { prisma } from './db';

export function listNews(limit?: number) {
  return prisma.newsPost.findMany({
    orderBy: { publishedAt: 'desc' },
    take: limit,
    select: {
      slug: true, title: true, excerpt: true, category: true,
      publishedAt: true, featured: true, coverImage: true, author: true,
    },
  });
}

export function getNews(slug: string) {
  return prisma.newsPost.findUnique({ where: { slug } });
}

export function formatNewsDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
