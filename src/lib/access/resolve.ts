export type AccessReason =
  | 'ADMIN'
  | 'SUBSCRIBED'
  | 'PURCHASED'
  | 'FREE_FOREVER'
  | 'TRIAL_ACTIVE'
  | 'TRIAL_EXPIRED'
  | 'TRIAL_AVAILABLE'
  | 'PREVIEW_ONLY';

export type AccessInput = {
  user: { id: string; role: 'READER' | 'ADMIN' } | null;
  book: {
    accessType: 'FREE_FOREVER' | 'FREE_TRIAL' | 'PAID';
    previewPages: number;
    freeTrialDays: number;
  };
  bookAccess: { trialExpiresAt: Date | null } | null;
  subscription: { status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'; expiresAt: Date } | null;
  purchase: { status: 'PENDING' | 'SUCCEEDED' | 'FAILED' } | null;
  now: Date;
};

export type AccessResult = {
  canRead: boolean;
  reason: AccessReason;
  previewPages: number;
  trialEndsAt?: Date;
};

/**
 * The one rule deciding who may read what.
 *
 * Pure: no I/O, no clock of its own, no database. Every paywall, free week and
 * purchase in the product resolves through here, which is why it's the most
 * heavily tested unit in the codebase. First match wins.
 */
export function resolveAccess(i: AccessInput): AccessResult {
  const previewPages = i.book.previewPages;

  const at = (canRead: boolean, reason: AccessReason, trialEndsAt?: Date): AccessResult =>
    trialEndsAt ? { canRead, reason, previewPages, trialEndsAt } : { canRead, reason, previewPages };

  // 1. Admins can open anything.
  if (i.user?.role === 'ADMIN') return at(true, 'ADMIN');

  // without an identity there's nothing to attach an entitlement to, so a
  // signed-out visitor can only reach a permanently free book. Guarding here
  // rather than per rule means a stray subscription row can't leak a paid book
  // to an anonymous request.
  if (!i.user) {
    return i.book.accessType === 'FREE_FOREVER'
      ? at(true, 'FREE_FOREVER')
      : at(false, 'PREVIEW_ONLY');
  }

  // 2. An active, unexpired subscription unlocks the whole library.
  if (i.subscription && i.subscription.status === 'ACTIVE' && i.subscription.expiresAt > i.now) {
    return at(true, 'SUBSCRIBED');
  }

  // 3. A completed purchase of this particular book.
  if (i.purchase?.status === 'SUCCEEDED') return at(true, 'PURCHASED');

  // 4. Permanently free.
  if (i.book.accessType === 'FREE_FOREVER') return at(true, 'FREE_FOREVER');

  // 5-6. The free window.
  if (i.book.accessType === 'FREE_TRIAL') {
    const ends = i.bookAccess?.trialExpiresAt ?? null;

    if (ends) {
      // Expiring exactly now counts as expired.
      return ends > i.now ? at(true, 'TRIAL_ACTIVE', ends) : at(false, 'TRIAL_EXPIRED', ends);
    }

    // Never opened: this reader can still start their week.
    return at(false, 'TRIAL_AVAILABLE');
  }

  // 7. Everything else gets the preview.
  return at(false, 'PREVIEW_ONLY');
}
