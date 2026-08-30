import { describe, it, expect } from 'vitest';
import { resolveAccess, type AccessInput } from './resolve';

const NOW = new Date('2026-08-31T12:00:00Z');
const days = (n: number) => new Date(NOW.getTime() + n * 86_400_000);

const base = (over: Partial<AccessInput> = {}): AccessInput => ({
  user: { id: 'u1', role: 'READER' },
  book: { accessType: 'PAID', previewPages: 2, freeTrialDays: 7 },
  bookAccess: null,
  subscription: null,
  purchase: null,
  now: NOW,
  ...over,
});

const TRIAL_BOOK = { accessType: 'FREE_TRIAL' as const, previewPages: 2, freeTrialDays: 7 };
const FREE_BOOK = { accessType: 'FREE_FOREVER' as const, previewPages: 2, freeTrialDays: 7 };

describe('resolveAccess', () => {
  it('lets an admin read anything', () => {
    expect(resolveAccess(base({ user: { id: 'a', role: 'ADMIN' } })))
      .toMatchObject({ canRead: true, reason: 'ADMIN' });
  });

  it('lets an active subscriber read a paid book', () => {
    expect(resolveAccess(base({ subscription: { status: 'ACTIVE', expiresAt: days(30) } })))
      .toMatchObject({ canRead: true, reason: 'SUBSCRIBED' });
  });

  it('does not honour a subscription that has run out', () => {
    expect(resolveAccess(base({ subscription: { status: 'ACTIVE', expiresAt: days(-1) } })).canRead)
      .toBe(false);
  });

  it('does not honour a cancelled subscription even if the date is future', () => {
    expect(resolveAccess(base({ subscription: { status: 'CANCELLED', expiresAt: days(30) } })).canRead)
      .toBe(false);
  });

  it('lets a buyer read the book they bought', () => {
    expect(resolveAccess(base({ purchase: { status: 'SUCCEEDED' } })))
      .toMatchObject({ canRead: true, reason: 'PURCHASED' });
  });

  it('does not unlock on a pending or failed purchase', () => {
    expect(resolveAccess(base({ purchase: { status: 'PENDING' } })).canRead).toBe(false);
    expect(resolveAccess(base({ purchase: { status: 'FAILED' } })).canRead).toBe(false);
  });

  it('lets anyone read a permanently free book, signed in or not', () => {
    expect(resolveAccess(base({ book: FREE_BOOK })))
      .toMatchObject({ canRead: true, reason: 'FREE_FOREVER' });
    expect(resolveAccess(base({ book: FREE_BOOK, user: null })))
      .toMatchObject({ canRead: true, reason: 'FREE_FOREVER' });
  });

  it('lets a reader inside their 7-day window read, and reports the end date', () => {
    const r = resolveAccess(base({ book: TRIAL_BOOK, bookAccess: { trialExpiresAt: days(3) } }));
    expect(r).toMatchObject({ canRead: true, reason: 'TRIAL_ACTIVE' });
    expect(r.trialEndsAt).toEqual(days(3));
  });

  it('closes the book when the window has passed', () => {
    const r = resolveAccess(base({ book: TRIAL_BOOK, bookAccess: { trialExpiresAt: days(-1) } }));
    expect(r).toMatchObject({ canRead: false, reason: 'TRIAL_EXPIRED' });
    expect(r.trialEndsAt).toEqual(days(-1));
  });

  it('treats a window expiring exactly now as expired', () => {
    expect(resolveAccess(base({ book: TRIAL_BOOK, bookAccess: { trialExpiresAt: NOW } })).reason)
      .toBe('TRIAL_EXPIRED');
  });

  it('offers the window to a signed-in reader who has not started it', () => {
    expect(resolveAccess(base({ book: TRIAL_BOOK })))
      .toMatchObject({ canRead: false, reason: 'TRIAL_AVAILABLE' });
  });

  it('shows a signed-out visitor only the preview on a trial book', () => {
    expect(resolveAccess(base({ book: TRIAL_BOOK, user: null })))
      .toMatchObject({ canRead: false, reason: 'PREVIEW_ONLY' });
  });

  it('shows only a preview on a paid book with nothing to unlock it', () => {
    expect(resolveAccess(base())).toMatchObject({ canRead: false, reason: 'PREVIEW_ONLY' });
  });

  it('prefers the subscription when the reader both subscribes and owns the book', () => {
    expect(resolveAccess(base({
      subscription: { status: 'ACTIVE', expiresAt: days(30) },
      purchase: { status: 'SUCCEEDED' },
    })).reason).toBe('SUBSCRIBED');
  });

  it('lets an expired trial still be unlocked by a later purchase', () => {
    expect(resolveAccess(base({
      book: TRIAL_BOOK,
      bookAccess: { trialExpiresAt: days(-2) },
      purchase: { status: 'SUCCEEDED' },
    }))).toMatchObject({ canRead: true, reason: 'PURCHASED' });
  });

  it("always reports the book's preview allowance", () => {
    expect(resolveAccess(base({
      book: { accessType: 'PAID', previewPages: 5, freeTrialDays: 7 },
    })).previewPages).toBe(5);
  });

  it('is pure: the same input always gives the same answer', () => {
    const input = base({ book: TRIAL_BOOK, bookAccess: { trialExpiresAt: days(2) } });
    expect(resolveAccess(input)).toEqual(resolveAccess(input));
  });

  it('never grants a signed-out visitor anything but a free book', () => {
    for (const accessType of ['PAID', 'FREE_TRIAL'] as const) {
      const r = resolveAccess(base({
        user: null,
        book: { accessType, previewPages: 2, freeTrialDays: 7 },
        subscription: { status: 'ACTIVE', expiresAt: days(30) },
        purchase: { status: 'SUCCEEDED' },
        bookAccess: { trialExpiresAt: days(5) },
      }));
      // Even with rows present, no identity means no entitlement is attributable.
      expect(r.canRead, accessType).toBe(false);
    }
  });
});
