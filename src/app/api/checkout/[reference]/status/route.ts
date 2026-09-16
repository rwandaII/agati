import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/auth/guards';
import { paymentProvider } from '@/lib/payments';
import { fulfilPurchase } from '@/lib/payments/fulfil';

/**
 * Polled by the checkout screen while the customer approves on their phone.
 * Also the backstop for a webhook that never turns up: both paths go through
 * the same idempotent fulfil().
 */
export async function GET(_req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;

  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

  // own purchases only
  const purchase = await prisma.purchase.findFirst({
    where: { reference, userId: user.id },
    include: { book: { select: { slug: true, title: true } } },
  });
  if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (purchase.status === 'SUCCEEDED') {
    return NextResponse.json({
      status: 'succeeded',
      outcome: 'already',
      bookSlug: purchase.book?.slug ?? null,
      kind: purchase.kind,
    });
  }
  if (purchase.status === 'FAILED') {
    return NextResponse.json({ status: 'failed', outcome: 'failed', kind: purchase.kind });
  }
  if (!purchase.providerChargeId) {
    return NextResponse.json({ status: 'pending', outcome: 'no_charge', kind: purchase.kind });
  }

  try {
    const verified = await paymentProvider().getCharge(purchase.providerChargeId);
    const outcome = await fulfilPurchase(reference, verified);

    if (verified.status === 'failed') {
      await prisma.purchase.update({ where: { reference }, data: { status: 'FAILED' } });
    }

    return NextResponse.json({
      status: verified.status,
      outcome,
      bookSlug: purchase.book?.slug ?? null,
      kind: purchase.kind,
    });
  } catch {
    return NextResponse.json({ status: 'pending', outcome: 'unreachable', kind: purchase.kind });
  }
}
