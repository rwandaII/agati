import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/db';
import sitemap from './sitemap';

describe('sitemap', () => {
  beforeAll(async () => {
    await prisma.book.deleteMany({ where: { slug: 'sm-book' } });
    await prisma.newsPost.deleteMany({ where: { slug: 'sm-news' } });

    await prisma.book.create({ data: {
      slug: 'sm-book', title: 'T', author: 'A', summary: 's', description: 'd',
      category: 'c', accessType: 'PAID', priceRwf: 1000, pageCount: 1 } });
    await prisma.newsPost.create({ data: {
      slug: 'sm-news', title: 'T', excerpt: 'e', body: 'b', category: 'c' } });
  });

  afterAll(async () => {
    await prisma.book.deleteMany({ where: { slug: 'sm-book' } });
    await prisma.newsPost.deleteMany({ where: { slug: 'sm-news' } });
    await prisma.$disconnect();
  });

  it('lists every section', async () => {
    const urls = (await sitemap()).map((e) => e.url);
    for (const p of ['/about', '/programs', '/news', '/library', '/contact']) {
      expect(urls.some((u) => u.endsWith(p)), p).toBe(true);
    }
    expect(urls.some((u) => u.endsWith('3000/'))).toBe(true);
  });

  it('lists paid books as well as free ones', async () => {
    expect((await sitemap()).map((e) => e.url).some((u) => u.includes('/books/sm-book'))).toBe(true);
  });

  it('lists news posts', async () => {
    expect((await sitemap()).map((e) => e.url).some((u) => u.includes('/news/sm-news'))).toBe(true);
  });

  it('never exposes private routes', async () => {
    const urls = (await sitemap()).map((e) => e.url).join(' ');
    for (const p of ['/admin', '/account', '/shelf', '/checkout']) {
      expect(urls, p).not.toContain(p);
    }
  });
})
