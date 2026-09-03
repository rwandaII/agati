import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Spread } from '@/components/book/Spread';
import { Scroller } from '@/components/ui/Prose';
import { Waiting } from '@/components/checkout/Waiting';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';

export const metadata: Metadata = { title: 'Confirming your payment' };

export default async function CheckoutStatus({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const user = await requireUser();

  // A reader may only ever see their own purchase.
  const purchase = await prisma.purchase.findFirst({
    where: { reference, userId: user.id },
    include: { book: { select: { title: true } } },
  });
  if (!purchase) notFound();

  const what =
    purchase.kind === 'SUBSCRIPTION'
      ? purchase.plan === 'YEARLY'
        ? 'a year of everything'
        : 'a month of everything'
      : (purchase.book?.title ?? 'your book');

  return (
    <Spread
      running="Checkout"
      folio={24}
      left={
        <Scroller>
          <Waiting reference={reference} amountRwf={purchase.amountRwf} what={what} />
        </Scroller>
      }
      right={
        <Scroller>
          <p className="account__note">
            Keep this page open. It checks for itself and will tell you the moment the payment
            lands. If you close it by accident, your account page will show whether it went through.
          </p>
        </Scroller>
      }
    />
  );
}
