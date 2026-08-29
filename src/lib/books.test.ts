import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from './db';
import { listBooks, getBook } from './books';

const mk = (over: Record<string, unknown>) => ({
  title: 'T', author: 'A', summary: 's', description: 'd',
  category: 'Folk tales', pageCount: 10, ...over,
});

describe('listBooks', () => {
  beforeAll(async () => {
    await prisma.book.deleteMany({ where: { slug: { startsWith: 'lb-' } } });
    await prisma.book.createMany({
      data: [
        mk({ slug: 'lb-free', accessType: 'FREE_FOREVER', priceRwf: 0, language: 'EN', title: 'Free Fables' }),
        mk({ slug: 'lb-paid', accessType: 'PAID', priceRwf: 2500, language: 'RW', title: 'Paid Story' }),
        mk({ slug: 'lb-trial', accessType: 'FREE_TRIAL', priceRwf: 1500, language: 'FR', title: 'Trial Tale' }),
      ],
    });
  });

  afterAll(async () => {
    await prisma.book.deleteMany({ where: { slug: { startsWith: 'lb-' } } });
    await prisma.$disconnect();
  });

  it('returns every book when unfiltered', async () => {
    const slugs = (await listBooks({})).map((b) => b.slug);
    expect(slugs).toEqual(expect.arrayContaining(['lb-free', 'lb-paid', 'lb-trial']));
  });

  it('filters to free books only', async () => {
    const slugs = (await listBooks({ access: 'free' })).map((b) => b.slug);
    expect(slugs).toContain('lb-free');
    expect(slugs).not.toContain('lb-paid');
    expect(slugs).not.toContain('lb-trial');
  });

  it('filters to paid books, including trials that convert', async () => {
    const slugs = (await listBooks({ access: 'paid' })).map((b) => b.slug);
    expect(slugs).toEqual(expect.arrayContaining(['lb-paid', 'lb-trial']));
    expect(slugs).not.toContain('lb-free');
  });

  it('filters by language', async () => {
    const slugs = (await listBooks({ language: 'RW' })).map((b) => b.slug);
    expect(slugs).toContain('lb-paid');
    expect(slugs).not.toContain('lb-free');
  });

  it('matches titles case-insensitively', async () => {
    const slugs = (await listBooks({ q: 'fable' })).map((b) => b.slug);
    expect(slugs).toContain('lb-free');
  });

  it('puts featured books first', async () => {
    const books = await listBooks({});
    const firstUnfeatured = books.findIndex((b) => !b.featured);
    const lastFeatured = books.map((b) => b.featured).lastIndexOf(true);
    if (firstUnfeatured !== -1 && lastFeatured !== -1) {
      expect(lastFeatured).toBeLessThan(firstUnfeatured);
    }
  });

  it('finds a single book by slug and returns null for an unknown one', async () => {
    expect((await getBook('lb-paid'))?.title).toBe('Paid Story');
    expect(await getBook('lb-nope')).toBeNull();
  });
});
