import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { prisma } from '@/lib/db';
import { fulfilPurchase, newReference } from './fulfil';

let userId = '';
let bookId = '';

const verified = (over: Record<string, unknown> = {}) => ({
  chargeId: 'chg_x',
  status: 'succeeded' as const,
  amountRwf: 2500,
  currency: 'RWF',
  reference: 'ref_book',
  ...over,
});

async function wipe() {
  await prisma.subscription.deleteMany({ where: { user: { email: 'ful@test.com' } } });
  await prisma.purchase.deleteMany({ where: { user: { email: 'ful@test.com' } } });
  await prisma.user.deleteMany({ where: { email: 'ful@test.com' } });
  await prisma.book.deleteMany({ where: { slug: 'ful-book' } });
}

beforeEach(async () => {
  await wipe();

  const user = await prisma.user.create({
    data: { email: 'ful@test.com', name: 'F', passwordHash: 'x' },
  });
  const book = await prisma.book.create({
    data: {
      slug: 'ful-book',
      title: 'B',
      author: 'A',
      summary: 's',
      description: 'd',
      category: 'c',
      accessType: 'PAID',
      priceRwf: 2500,
      pageCount: 3,
    },
  });

  userId = user.id;
  bookId = book.id;

  await prisma.purchase.create({
    data: {
      userId,
      bookId,
      kind: 'BOOK',
      amountRwf: 2500,
      provider: 'mock',
      reference: 'ref_book',
      providerChargeId: 'chg_x',
    },
  });
});

afterAll(async () => {
  await wipe();
  await prisma.$disconnect();
});

describe('fulfilPurchase', () => {
  it('marks a matching charge as succeeded', async () => {
    expect(await fulfilPurchase('ref_book', verified())).toBe('fulfilled');
    const p = await prisma.purchase.findUniqueOrThrow({ where: { reference: 'ref_book' } });
    expect(p.status).toBe('SUCCEEDED');
  });

  it('is idempotent, so a replayed webhook grants nothing twice', async () => {
    expect(await fulfilPurchase('ref_book', verified())).toBe('fulfilled');
    expect(await fulfilPurchase('ref_book', verified())).toBe('already');
    expect(await prisma.purchase.count({ where: { reference: 'ref_book' } })).toBe(1);
  });

  it('refuses when the amount does not match what we recorded', async () => {
    expect(await fulfilPurchase('ref_book', verified({ amountRwf: 100 }))).toBe('mismatch');
    const p = await prisma.purchase.findUniqueOrThrow({ where: { reference: 'ref_book' } });
    expect(p.status).toBe('PENDING');
  });

  it('refuses a currency other than RWF', async () => {
    expect(await fulfilPurchase('ref_book', verified({ currency: 'NGN' }))).toBe('mismatch');
  });

  it('refuses when the reference does not match', async () => {
    expect(await fulfilPurchase('ref_book', verified({ reference: 'someone_else' }))).toBe(
      'mismatch',
    );
  });

  it('does nothing for a charge that has not succeeded', async () => {
    expect(await fulfilPurchase('ref_book', verified({ status: 'pending' }))).toBe('not_succeeded');
    expect(await fulfilPurchase('ref_book', verified({ status: 'failed' }))).toBe('not_succeeded');
  });

  it('reports an unknown reference', async () => {
    expect(await fulfilPurchase('no_such_ref', verified())).toBe('unknown');
  });

  it('starts a subscription that expires a year later', async () => {
    await prisma.purchase.create({
      data: {
        userId,
        kind: 'SUBSCRIPTION',
        plan: 'YEARLY',
        amountRwf: 13000,
        provider: 'mock',
        reference: 'ref_sub',
        providerChargeId: 'chg_s',
      },
    });

    const out = await fulfilPurchase(
      'ref_sub',
      verified({ amountRwf: 13000, reference: 'ref_sub', chargeId: 'chg_s' }),
    );
    expect(out).toBe('fulfilled');

    const sub = await prisma.subscription.findFirstOrThrow({ where: { userId } });
    expect(sub.status).toBe('ACTIVE');
    expect(sub.plan).toBe('YEARLY');

    const days = (sub.expiresAt.getTime() - sub.startedAt.getTime()) / 86_400_000;
    expect(days).toBeGreaterThan(360);
  });

  it('does not create a second subscription when replayed', async () => {
    await prisma.purchase.create({
      data: {
        userId,
        kind: 'SUBSCRIPTION',
        plan: 'MONTHLY',
        amountRwf: 1300,
        provider: 'mock',
        reference: 'ref_sub2',
        providerChargeId: 'chg_s2',
      },
    });

    const v = verified({ amountRwf: 1300, reference: 'ref_sub2', chargeId: 'chg_s2' });
    await fulfilPurchase('ref_sub2', v);
    await fulfilPurchase('ref_sub2', v);

    expect(await prisma.subscription.count({ where: { userId } })).toBe(1);
  });

  it('starts no subscription when the amount is wrong', async () => {
    await prisma.purchase.create({
      data: {
        userId,
        kind: 'SUBSCRIPTION',
        plan: 'YEARLY',
        amountRwf: 13000,
        provider: 'mock',
        reference: 'ref_sub3',
        providerChargeId: 'chg_s3',
      },
    });

    expect(await fulfilPurchase('ref_sub3', verified({ amountRwf: 999, reference: 'ref_sub3' }))).toBe(
      'mismatch',
    );
    expect(await prisma.subscription.count({ where: { userId } })).toBe(0);
  });
});

describe('newReference', () => {
  it('is unique and tagged by kind', () => {
    const a = newReference('bk');
    const b = newReference('bk');
    expect(a).not.toBe(b);
    expect(a).toMatch(/^agati_bk_/);
    expect(newReference('sub')).toMatch(/^agati_sub_/);
  });
});
