import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from './db';
import { listNews, getNews, formatNewsDate } from './news';

describe('news', () => {
  beforeAll(async () => {
    await prisma.newsPost.deleteMany({ where: { slug: { startsWith: 'nt-' } } });
    await prisma.newsPost.createMany({
      data: [
        { slug: 'nt-old', title: 'Older', excerpt: 'e', body: 'b', category: 'Milestones', publishedAt: new Date('2024-01-01') },
        { slug: 'nt-new', title: 'Newer', excerpt: 'e', body: 'b', category: 'Milestones', publishedAt: new Date('2026-01-01') },
      ],
    });
  });

  afterAll(async () => {
    await prisma.newsPost.deleteMany({ where: { slug: { startsWith: 'nt-' } } });
    await prisma.$disconnect();
  });

  it('returns newest first', async () => {
    const slugs = (await listNews()).map((n) => n.slug);
    expect(slugs.indexOf('nt-new')).toBeLessThan(slugs.indexOf('nt-old'));
  });

  it('honours a limit', async () => {
    expect((await listNews(2)).length).toBe(2);
  });

  it('fetches one post by slug', async () => {
    expect((await getNews('nt-new'))?.title).toBe('Newer');
  });

  it('returns null for an unknown slug', async () => {
    expect(await getNews('nope')).toBeNull();
  });

  it('formats a date a human would read', () => {
    expect(formatNewsDate(new Date('2026-06-14T00:00:00Z'))).toBe('14 June 2026');
  });
});
