import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/auth/guards';
import { loadAccess, startTrial } from '@/lib/access/queries';

/** Starts the free window the first time a signed-in reader opens the book. */
export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Sign in to start your free week.' }, { status: 401 });
  }

  const book = await prisma.book.findUnique({ where: { slug } });
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (book.accessType === 'FREE_TRIAL') await startTrial(user.id, book);

  const access = await loadAccess(user.id, book);
  return NextResponse.json({
    reason: access.reason,
    canRead: access.canRead,
    trialEndsAt: access.trialEndsAt ?? null,
  });
}
