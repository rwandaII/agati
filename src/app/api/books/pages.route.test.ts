import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '@/lib/db';

let signedInAs: string | null = null;

vi.mock('@/lib/auth/guards', () => ({
  currentUser: async () =>
    signedInAs ? prisma.user.findUnique({ where: { id: signedInAs } }) : null,
}));

const { GET } = await import('./[slug]/pages/route');

const get = (slug: string, from: number, to: number) =>
  GET(new Request(`http://localhost/api/books/${slug}/pages?from=${from}&to=${to}`), {
    params: Promise.resolve({ slug }),
  });

describe('GET /api/books/[slug]/pages', () => {
  beforeAll(async () => {
    await prisma.book.deleteMany({ where: { slug: { startsWith: 'gate-' } } });

    await prisma.book.create({ data: {
      slug: 'gate-paid', title: 'Paid', author: 'A', summary: 's', description: 'd',
      category: 'c', accessType: 'PAID', priceRwf: 3000, previewPages: 2, pageCount: 10,
      pages: { create: Array.from({ length: 10 }, (_, i) => ({ index: i, content: `SECRET-${i}` })) },
    }});

    await prisma.book.create({ data: {
      slug: 'gate-free', title: 'Free', author: 'A', summary: 's', description: 'd',
      category: 'c', accessType: 'FREE_FOREVER', previewPages: 2, pageCount: 3,
      pages: { create: Array.from({ length: 3 }, (_, i) => ({ index: i, content: `OPEN-${i}` })) },
    }});
  });

  afterAll(async () => {
    await prisma.book.deleteMany({ where: { slug: { startsWith: 'gate-' } } });
    await prisma.$disconnect();
  });

  it('serves a free book in full to a signed-out visitor', async () => {
    signedInAs = null;
    const res = await get('gate-free', 0, 2);
    expect(res.status).toBe(200);
    expect(JSON.stringify(await res.json())).toContain('OPEN-2');
  });

  it('serves the preview of a paid book', async () => {
    signedInAs = null;
    expect((await get('gate-paid', 0, 1)).status).toBe(200);
  });

  it('refuses paid pages past the preview with 402 and leaks no text', async () => {
    signedInAs = null;
    const res = await get('gate-paid', 2, 9);
    expect(res.status).toBe(402);
    expect(JSON.stringify(await res.json())).not.toContain('SECRET');
  });

  it('never leaks a paid page even when the range starts inside the preview', async () => {
    signedInAs = null;
    const body = JSON.stringify(await (await get('gate-paid', 0, 9)).json());
    expect(body).toContain('SECRET-0');
    expect(body).toContain('SECRET-1');
    expect(body).not.toContain('SECRET-2');
    expect(body).not.toContain('SECRET-9');
  });

  it('404s an unknown book', async () => {
    expect((await get('no-such-book', 0, 1)).status).toBe(404);
  });

  it('caps an absurd range instead of dumping the whole book', async () => {
    signedInAs = null;
    const json = await (await get('gate-free', 0, 100000)).json();
    expect(json.pages.length).toBeLessThanOrEqual(41);
  });
});
