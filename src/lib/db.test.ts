import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from './db';

describe('schema', () => {
  afterAll(async () => {
    await prisma.book.deleteMany({ where: { slug: 'schema-probe' } });
    await prisma.$disconnect();
  });

  it('stores a book with pages and enum values', async () => {
    await prisma.book.deleteMany({ where: { slug: 'schema-probe' } });

    const book = await prisma.book.create({
      data: {
        slug: 'schema-probe',
        title: 'Probe',
        author: 'Test',
        summary: 's',
        description: 'd',
        category: 'test',
        accessType: 'FREE_TRIAL',
        language: 'RW',
        priceRwf: 2000,
        pageCount: 1,
        pages: { create: [{ index: 0, content: 'hello' }] },
      },
      include: { pages: true },
    });

    expect(book.accessType).toBe('FREE_TRIAL');
    expect(book.language).toBe('RW');
    expect(book.pages[0].content).toBe('hello');
  });
})
