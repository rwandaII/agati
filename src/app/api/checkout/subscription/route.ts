import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/auth/guards';
import { paymentProvider } from '@/lib/payments';
import { newReference } from '@/lib/payments/fulfil';
import { normalizeRwandaPhone } from '@/lib/payments/phone';
import { PLANS } from '@/config/pricing';

const Body = z.object({
  plan: z.enum(['MONTHLY', 'YEARLY']),
  phone: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  if (!normalizeRwandaPhone(parsed.data.phone)) {
    return NextResponse.json(
      { error: 'That does not look like a Rwandan mobile number.' },
      { status: 400 },
    );
  }

  const existing = await prisma.subscription.findFirst({
    where: { userId: user.id, status: 'ACTIVE', expiresAt: { gt: new Date() } },
  });
  if (existing) {
    return NextResponse.json({ error: 'You already have an active subscription.' }, { status: 409 });
  }

  // amount comes from our own price table, never from the request body
  const plan = parsed.data.plan;
  const amountRwf = PLANS[plan].rwf;
  const reference = newReference('sub');
  const provider = paymentProvider();

  const purchase = await prisma.purchase.create({
    data: {
      userId: user.id,
      kind: 'SUBSCRIPTION',
      plan,
      amountRwf,
      status: 'PENDING',
      provider: provider.name,
      reference,
      phone: parsed.data.phone,
    },
  });

  try {
    const charge = await provider.createCharge({
      reference,
      amountRwf,
      phone: parsed.data.phone,
      email: user.email,
      name: user.name,
      description: `Agati Library: ${plan === 'YEARLY' ? 'one year' : 'one month'}`,
    });

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { providerChargeId: charge.chargeId },
    });

    return NextResponse.json({
      reference,
      redirectUrl: charge.redirectUrl ?? null,
      instruction: charge.instruction ?? null,
      amountRwf,
    });
  } catch (err) {
    await prisma.purchase.update({ where: { id: purchase.id }, data: { status: 'FAILED' } });
    const message = err instanceof Error ? err.message : 'Payment could not be started.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
