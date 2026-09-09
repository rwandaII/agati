import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/auth/guards';

const Body = z.object({
  slug: z.string().min(1),
  /** The stored page reached, for showing how far through a book someone is. */
  pageIndex: z.number().int().min(0),
  /** Where to reopen the book: see `src/lib/reading/anchor.ts`. */
  anchor: z.number().int().min(0).default(0),
});

/** Saving a place is a convenience, not a requirement: never an error when signed out. */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return new NextResponse(null, { status: 204 });

  // A reader closing the tab sends this with `sendBeacon`, which posts a Blob
  // and so may arrive as text/plain rather than JSON.
  const raw = await req.text().catch(() => '');
  const parsed = Body.safeParse(((): unknown => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  })());
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const book = await prisma.book.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true },
  });
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { pageIndex, anchor } = parsed.data;

  await prisma.readingProgress.upsert({
    where: { userId_bookId: { userId: user.id, bookId: book.id } },
    update: { pageIndex, anchor },
    create: { userId: user.id, bookId: book.id, pageIndex, anchor },
  });

  return NextResponse.json({ ok: true });
}
