import crypto from 'node:crypto';
import { prisma } from '@/lib/db';
import { subscriptionEnd } from '@/config/pricing';
import type { ChargeStatus } from './types';

export type FulfilOutcome = 'fulfilled' | 'already' | 'not_succeeded' | 'mismatch' | 'unknown';

export function newReference(kind: 'bk' | 'sub'): string {
  return `agati_${kind}_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

/**
 * The single door through which a purchase becomes SUCCEEDED.
 *
 * Called by the webhook and by the status poll, so a missed webhook never
 * leaves a paying reader locked out and a replayed one never grants twice.
 * Nothing is trusted from the notification: amount, currency and reference are
 * all re-checked against what we recorded when the charge was created.
 */
export async function fulfilPurchase(
  reference: string,
  verified: ChargeStatus,
): Promise<FulfilOutcome> {
  const purchase = await prisma.purchase.findUnique({ where: { reference } });
  if (!purchase) return 'unknown';
  if (purchase.status === 'SUCCEEDED') return 'already';
  if (verified.status !== 'succeeded') return 'not_succeeded';

  if (
    verified.reference !== purchase.reference ||
    verified.amountRwf !== purchase.amountRwf ||
    verified.currency !== 'RWF'
  ) {
    return 'mismatch';
  }

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.purchase.findUniqueOrThrow({ where: { reference } });
    if (fresh.status === 'SUCCEEDED') return; // lost a race; nothing to do

    await tx.purchase.update({
      where: { reference },
      data: { status: 'SUCCEEDED', providerChargeId: verified.chargeId },
    });

    if (fresh.kind === 'SUBSCRIPTION' && fresh.plan) {
      const startedAt = new Date();
      await tx.subscription.create({
        data: {
          userId: fresh.userId,
          plan: fresh.plan,
          status: 'ACTIVE',
          startedAt,
          expiresAt: subscriptionEnd(startedAt, fresh.plan),
          purchaseId: fresh.id,
        },
      });
    }
  });

  return 'fulfilled';
}
