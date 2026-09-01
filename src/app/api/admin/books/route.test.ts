import { describe, it, expect, vi, afterAll } from 'vitest';
import { prisma } from '@/lib/db';

let role: 'READER' | 'ADMIN' = 'ADMIN';

vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: async () => {
    if (role !== 'ADMIN') throw new Error('NEXT_REDIRECT');
    return { id: 'admin1', role: 'ADMIN' };
  },
}));

const { POST, PATCH } = await import('./route');

const post = (body: unknown) =>
  POST(
    new Request('http://localhost/api/admin/books', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

const patch = (body: unknown) =>
  PATCH(
    new Request('http://localhost/api/admin/books', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

const valid = {
  slug: 'adm-book',
  title: 'Admin Added',
  author: 'Agati',
  summary: 's',
  description: 'd',
  category: 'Agati Originals',
  language: 'RW',
  accessType: 'FREE_TRIAL',
  priceRwf: 1800,
  freeTrialDays: 7,
  text: Array.from({ length: 60 }, (_, i) => `Paragraph ${i} of the new book.`).join('\n\n'),
};

describe('POST /api/admin/books', () => {
  afterAll(async () => {
    await prisma.book.deleteMany({ where: { slug: { startsWith: 'adm-' } } });
    await prisma.$disconnect();
  });

  it('creates a book and paginates the pasted text', async () => {
    role = 'ADMIN';
    const res = await post(valid);
    expect(res.status).toBe(201);

    const book = await prisma.book.findUniqueOrThrow({
      where: { slug: 'adm-book' },
      include: { pages: true },
    });

    expect(book.accessType).toBe('FREE_TRIAL');
    expect(book.priceRwf).toBe(1800);
    expect(book.language).toBe('RW');
    expect(book.pages.length).toBeGreaterThan(1);
    expect(book.pageCount).toBe(book.pages.length);
  });

  it('refuses a non-admin', async () => {
    role = 'READER';
    await expect(post({ ...valid, slug: 'adm-denied' })).rejects.toThrow();
    expect(await prisma.book.findUnique({ where: { slug: 'adm-denied' } })).toBeNull();
  });

  it('rejects a duplicate slug', async () => {
    role = 'ADMIN';
    expect((await post(valid)).status).toBe(409);
  });

  it('rejects a paid book priced at zero', async () => {
    role = 'ADMIN';
    const res = await post({ ...valid, slug: 'adm-zero', accessType: 'PAID', priceRwf: 0 });
    expect(res.status).toBe(400);
  });

  it('rejects a slug with spaces or capitals', async () => {
    role = 'ADMIN';
    expect((await post({ ...valid, slug: 'Not A Slug' })).status).toBe(400);
  });

  it('lets an admin switch a book to the seven-day model', async () => {
    role = 'ADMIN';
    const book = await prisma.book.findUniqueOrThrow({ where: { slug: 'adm-book' } });

    const res = await patch({ id: book.id, accessType: 'PAID', priceRwf: 2400 });
    expect(res.status).toBe(200);

    const after = await prisma.book.findUniqueOrThrow({ where: { id: book.id } });
    expect(after.accessType).toBe('PAID');
    expect(after.priceRwf).toBe(2400);
  });

  it('leaves the pages alone when no new text is supplied', async () => {
    role = 'ADMIN';
    const before = await prisma.book.findUniqueOrThrow({ where: { slug: 'adm-book' } });
    const pagesBefore = await prisma.bookPage.count({ where: { bookId: before.id } });

    await patch({ id: before.id, title: 'Renamed' });

    expect(await prisma.bookPage.count({ where: { bookId: before.id } })).toBe(pagesBefore);
    const after = await prisma.book.findUniqueOrThrow({ where: { id: before.id } });
    expect(after.title).toBe('Renamed');
  });
});
