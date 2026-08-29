import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from './db';
import { search } from './search';

describe('search', () => {
  beforeAll(async () => {
    await prisma.book.deleteMany({ where: { slug: { startsWith: 'sr-' } } });
    await prisma.newsPost.deleteMany({ where: { slug: { startsWith: 'sr-' } } });

    await prisma.book.create({ data: {
      slug: 'sr-paid', title: 'Zebra Chronicles', author: 'A', summary: 'a zebra story',
      description: 'd', category: 'Adventure', accessType: 'PAID', priceRwf: 3000, pageCount: 5 } });
    await prisma.book.create({ data: {
      slug: 'sr-free', title: 'Zebra Fables', author: 'B', summary: 'free zebra tales',
      description: 'd', category: 'Folk tales', accessType: 'FREE_FOREVER', pageCount: 5 } });
    await prisma.book.create({ data: {
      slug: 'sr-trial', title: 'Zebra Weekly', author: 'C', summary: 'trial zebra',
      description: 'd', category: 'Adventure', accessType: 'FREE_TRIAL', priceRwf: 1500, pageCount: 5 } });
    await prisma.newsPost.create({ data: {
      slug: 'sr-news', title: 'A zebra visits the library', excerpt: 'e', body: 'zebra body',
      category: 'Stories' } });
  });

  afterAll(async () => {
    await prisma.book.deleteMany({ where: { slug: { startsWith: 'sr-' } } });
    await prisma.newsPost.deleteMany({ where: { slug: { startsWith: 'sr-' } } });
    await prisma.$disconnect();
  });

  it('finds paid and free books alike', async () => {
    const hrefs = (await search('zebra')).books.map((b) => b.href);
    expect(hrefs).toContain('/books/sr-paid');
    expect(hrefs).toContain('/books/sr-free');
  });

  it('finds news posts', async () => {
    expect((await search('zebra')).news.map((n) => n.href)).toContain('/news/sr-news');
  });

  it('finds static sections by name', async () => {
    expect((await search('programs')).pages.map((p) => p.href)).toContain('/programs');
  });

  it('labels each book hit with its access state', async () => {
    const r = await search('zebra');
    expect(r.books.find((b) => b.href === '/books/sr-paid')?.badge).toBe('3,000 RWF');
    expect(r.books.find((b) => b.href === '/books/sr-free')?.badge).toMatch(/free/i);
    expect(r.books.find((b) => b.href === '/books/sr-trial')?.badge).toBe('7 days free');
  });

  it('returns nothing for a blank query', async () => {
    expect((await search('   ')).total).toBe(0);
    expect((await search('')).total).toBe(0);
  });

  it('counts every kind of hit in the total', async () => {
    const r = await search('zebra');
    expect(r.total).toBe(r.books.length + r.news.length + r.pages.length);
  });

  it('searches descriptions, not just titles', async () => {
    const hrefs = (await search('Adventure')).books.map((b) => b.href);
    expect(hrefs).toContain('/books/sr-paid');
  });
});
