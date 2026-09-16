import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/auth/guards';
import { loadAccess } from '@/lib/access/queries';

const MAX_SPAN = 40;

/**
 * The only route that sends page text to the client.
 *
 * A reader without an entitlement gets the preview and nothing past it. The
 * ceiling is applied inside the query, so paid text is never loaded into
 * memory for them at all.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const book = await prisma.book.findUnique({ where: { slug } });
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const url = new URL(req.url);
  const from = Math.max(0, Number(url.searchParams.get('from') ?? 0) || 0);
  const rawTo = Number(url.searchParams.get('to') ?? from) || from;
  const to = Math.min(Math.max(from, rawTo), from + MAX_SPAN);

  const user = await currentUser();
  const access = await loadAccess(user?.id ?? null, book);

  const ceiling = access.canRead ? Number.POSITIVE_INFINITY : access.previewPages - 1;

  if (from > ceiling) {
    return NextResponse.json(
      {
        error: 'Payment required',
        reason: access.reason,
        trialEndsAt: access.trialEndsAt ?? null,
        previewPages: access.previewPages,
      },
      { status: 402 },
    );
  }

  const pages = await prisma.bookPage.findMany({
    where: { bookId: book.id, index: { gte: from, lte: Math.min(to, ceiling) } },
    orderBy: { index: 'asc' },
    select: { index: true, content: true },
  });

  return NextResponse.json({
    pages,
    reason: access.reason,
    canRead: access.canRead,
    previewPages: access.previewPages,
    trialEndsAt: access.trialEndsAt ?? null,
    pageCount: book.pageCount,
  });
}
