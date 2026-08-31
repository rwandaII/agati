import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/auth/guards';
import { loadAccess } from '@/lib/access/queries';
import { paymentProvider } from '@/lib/payments';
import { newReference } from '@/lib/payments/fulfil';
import { normalizeRwandaPhone } from '@/lib/payments/phone';

const Body = z.object({ slug: z.string().min(1), phone: z.string().min(1) });

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

  const book = await prisma.book.findUnique({ where: { slug: parsed.data.slug } });
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (book.accessType === 'FREE_FOREVER' || book.priceRwf <= 0) {
    return NextResponse.json({ error: 'This book is free — just read it.' }, { status: 400 });
  }

  const access = await loadAccess(user.id, book);
  if (access.reason === 'PURCHASED' || access.reason === 'SUBSCRIBED') {
    return NextResponse.json({ error: 'You can already read this book.' }, { status: 409 });
  }

  // The amount comes from the database, never from the request body.
  const amountRwf = book.priceRwf;
  const reference = newReference('bk');
  const provider = paymentProvider();

  const purchase = await prisma.purchase.create({
    data: {
      userId: user.id,
      bookId: book.id,
      kind: 'BOOK',
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
      description: book.title,
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
