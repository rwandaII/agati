import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/guards';
import { paginateText } from '@/lib/admin/paginateText';

const BookFields = z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Use lower-case letters, numbers and hyphens only.'),
    title: z.string().min(1),
    author: z.string().min(1),
    summary: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    language: z.enum(['EN', 'FR', 'RW']),
    accessType: z.enum(['FREE_FOREVER', 'FREE_TRIAL', 'PAID']),
    priceRwf: z.number().int().min(0),
    freeTrialDays: z.number().int().min(1).max(365).default(7),
    previewPages: z.number().int().min(0).max(50).default(2),
    coverColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#1B3A2F'),
    featured: z.boolean().default(false),
  text: z.string().min(1),
});

/** A book that can be bought needs a price, a free one doesn't. */
const Body = BookFields.refine((b) => b.accessType === 'FREE_FOREVER' || b.priceRwf > 0, {
  message: 'A book that can be bought needs a price above zero.',
  path: ['priceRwf'],
});

export async function POST(req: Request) {
  await requireAdmin();

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid book' },
      { status: 400 },
    );
  }

  const { text, ...meta } = parsed.data;

  if (await prisma.book.findUnique({ where: { slug: meta.slug } })) {
    return NextResponse.json({ error: 'That slug is already taken.' }, { status: 409 });
  }

  const pages = paginateText(text);

  const book = await prisma.book.create({
    data: {
      ...meta,
      pageCount: pages.length,
      pages: { create: pages.map((content, index) => ({ index, content })) },
    },
  });

  return NextResponse.json({ book: { id: book.id, slug: book.slug } }, { status: 201 });
}

const Patch = BookFields.partial().extend({ id: z.string().min(1) });

export async function PATCH(req: Request) {
  await requireAdmin();

  const parsed = Patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid update' }, { status: 400 });
  }

  const { id, text, ...meta } = parsed.data;

  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // only touch the pages when new text actually came in
  if (text) {
    const pages = paginateText(text);
    await prisma.bookPage.deleteMany({ where: { bookId: id } });
    await prisma.bookPage.createMany({
      data: pages.map((content, index) => ({ bookId: id, index, content })),
    });
    await prisma.book.update({ where: { id }, data: { ...meta, pageCount: pages.length } });
  } else {
    await prisma.book.update({ where: { id }, data: meta });
  }

  return NextResponse.json({ ok: true });
}
