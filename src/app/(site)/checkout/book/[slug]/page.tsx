import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead, Heading, Scroller } from '@/components/ui/Prose';
import { PhoneForm } from '@/components/checkout/PhoneForm';
import { requireUser } from '@/lib/auth/guards';
import { getBook } from '@/lib/books';
import { loadAccess } from '@/lib/access/queries';
import { PLANS } from '@/config/pricing';

export const metadata: Metadata = { title: 'Checkout' };

export default async function BookCheckout({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();

  const book = await getBook(slug);
  if (!book) notFound();

  if (book.accessType === 'FREE_FOREVER' || book.priceRwf <= 0) redirect(`/read/${book.slug}`);

  const access = await loadAccess(user.id, book);
  if (access.reason === 'PURCHASED' || access.reason === 'SUBSCRIBED') {
    redirect(`/read/${book.slug}`);
  }

  return (
    <Spread
      running="Checkout"
      folio={24}
      left={
        <Scroller>
          <PageTitle kicker={book.author}>{book.title}</PageTitle>
          <Lead>{book.summary}</Lead>
          <p>
            Buying this book keeps it for good. It stays on your shelf and opens on any device you
            sign in from.
          </p>

          <Heading>Or read everything</Heading>
          <p>
            A subscription is ${PLANS.YEARLY.usd} a year and opens every book Agati has. If you plan
            to read more than four, it is the cheaper way in.
          </p>
          <p>
            <Link className="btn btn--quiet" href="/subscribe">
              See the subscription
            </Link>
          </p>

          <p className="detail__back">
            <Link href={`/books/${book.slug}`}>← Back to the book</Link>
          </p>
        </Scroller>
      }
      right={
        <Scroller>
          <Heading>Pay with Mobile Money</Heading>
          <PhoneForm
            kind="book"
            slug={book.slug}
            amountRwf={book.priceRwf}
            label={`${book.title}: `}
          />
        </Scroller>
      }
    />
  );
}
