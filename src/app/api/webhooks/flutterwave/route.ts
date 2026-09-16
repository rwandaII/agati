import { NextResponse } from 'next/server';
import { paymentProvider } from '@/lib/payments';
import { fulfilPurchase } from '@/lib/payments/fulfil';

/**
 * The order of operations here is the security:
 *
 *  1. read the RAW body, re-serialising changes the signed bytes
 *  2. verify the HMAC in constant time, 401 if it fails
 *  3. use the payload only to work out WHICH charge this is about
 *  4. re-query the charge from the provider for the actual state
 *  5. fulfil, which re-checks amount, currency and reference
 *
 * Anything we understood answers 200 so the provider stops retrying.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const provider = paymentProvider();

  if (!provider.verifyWebhook(raw, req.headers.get('flutterwave-signature'))) {
    return NextResponse.json({ error: 'Bad signature' }, { status: 401 });
  }

  const parsed = provider.parseWebhook(raw);
  if (!parsed?.chargeId) {
    return NextResponse.json({ error: 'Unrecognised payload' }, { status: 400 });
  }

  const verified = await provider.getCharge(parsed.chargeId);
  const outcome = await fulfilPurchase(verified.reference, verified);

  return NextResponse.json({ outcome }, { status: 200 });
}
