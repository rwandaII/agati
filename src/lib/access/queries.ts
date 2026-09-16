import type { Book } from '@prisma/client';
import { prisma } from '@/lib/db';
import { resolveAccess, type AccessResult } from './resolve';

const DAY_MS = 86_400_000;

/** Loads exactly the rows resolveAccess needs, then applies the rule. */
export async function loadAccess(
  userId: string | null,
  book: Book,
  now: Date = new Date(),
): Promise<AccessResult> {
  if (!userId) {
    return resolveAccess({
      user: null,
      book,
      bookAccess: null,
      subscription: null,
      purchase: null,
      now,
    });
  }

  const [user, bookAccess, subscription, purchase] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } }),
    prisma.bookAccess.findUnique({
      where: { userId_bookId: { userId, bookId: book.id } },
      select: { trialExpiresAt: true },
    }),
    prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { expiresAt: 'desc' },
      select: { status: true, expiresAt: true },
    }),
    prisma.purchase.findFirst({
      where: { userId, bookId: book.id, kind: 'BOOK', status: 'SUCCEEDED' },
      select: { status: true },
    }),
  ]);

  return resolveAccess({ user, book, bookAccess, subscription, purchase, now });
}

/**
 * Starts the free window the first time a reader opens the book. Idempotent, so
 * reopening never buys more time.
 */
export async function startTrial(
  userId: string,
  book: Book,
  now: Date = new Date(),
): Promise<Date> {
  const existing = await prisma.bookAccess.findUnique({
    where: { userId_bookId: { userId, bookId: book.id } },
  });
  if (existing?.trialExpiresAt) return existing.trialExpiresAt;

  const trialExpiresAt = new Date(now.getTime() + book.freeTrialDays * DAY_MS);

  await prisma.bookAccess.upsert({
    where: { userId_bookId: { userId, bookId: book.id } },
    update: { trialExpiresAt },
    create: { userId, bookId: book.id, firstOpenedAt: now, trialExpiresAt },
  });

  return trialExpiresAt;
}
