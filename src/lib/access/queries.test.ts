import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/db';
import { loadAccess, startTrial } from './queries';

let bookId = '';
let userId = '';

const book = () => prisma.book.findUniqueOrThrow({ where: { id: bookId } });

describe('loadAccess / startTrial', () => {
  beforeAll(async () => {
    await prisma.book.deleteMany({ where: { slug: 'acc-trial' } });
    await prisma.user.deleteMany({ where: { email: 'acc@test.com' } });

    const b = await prisma.book.create({ data: {
      slug: 'acc-trial', title: 'Trial', author: 'A', summary: 's', description: 'd',
      category: 'c', accessType: 'FREE_TRIAL', priceRwf: 1500, freeTrialDays: 7, pageCount: 5 } });
    const u = await prisma.user.create({ data: {
      email: 'acc@test.com', name: 'Acc', passwordHash: 'x' } });

    bookId = b.id; userId = u.id;
  });

  afterAll(async () => {
    await prisma.book.deleteMany({ where: { slug: 'acc-trial' } });
    await prisma.user.deleteMany({ where: { email: 'acc@test.com' } });
    await prisma.$disconnect();
  });

  it('offers the window before it is started', async () => {
    expect((await loadAccess(userId, await book())).reason).toBe('TRIAL_AVAILABLE');
  });

  it('shows a signed-out visitor only the preview', async () => {
    const r = await loadAccess(null, await book());
    expect(r.canRead).toBe(false);
    expect(r.reason).toBe('PREVIEW_ONLY');
  });

  it('opens a 7-day window and then permits reading', async () => {
    const now = new Date('2026-08-31T00:00:00Z');
    const ends = await startTrial(userId, await book(), now);

    expect(ends.toISOString()).toBe('2026-09-07T00:00:00.000Z');
    expect(await loadAccess(userId, await book(), now))
      .toMatchObject({ canRead: true, reason: 'TRIAL_ACTIVE' });
  });

  it('does not restart the window if the reader opens the book again', async () => {
    const first = await startTrial(userId, await book(), new Date('2026-08-31T00:00:00Z'));
    const again = await startTrial(userId, await book(), new Date('2026-09-05T00:00:00Z'));
    expect(again.toISOString()).toBe(first.toISOString());
  });

  it('closes the book once the window has passed', async () => {
    const after = new Date('2026-09-20T00:00:00Z');
    expect(await loadAccess(userId, await book(), after))
      .toMatchObject({ canRead: false, reason: 'TRIAL_EXPIRED' });
  });

  it('reopens the book when a purchase lands, even after the window closed', async () => {
    await prisma.purchase.create({ data: {
      userId, bookId, kind: 'BOOK', amountRwf: 1500, status: 'SUCCEEDED',
      provider: 'mock', reference: `acc-test-${Date.now()}` } });

    const after = new Date('2026-09-20T00:00:00Z');
    expect(await loadAccess(userId, await book(), after))
      .toMatchObject({ canRead: true, reason: 'PURCHASED' });

    await prisma.purchase.deleteMany({ where: { userId } });
  });
});
