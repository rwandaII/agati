'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatRwf, PLANS } from '@/config/pricing';
import type { AccessReason } from '@/lib/access/resolve';

type Book = {
  slug: string;
  title: string;
  priceRwf: number;
  accessType: 'FREE_FOREVER' | 'FREE_TRIAL' | 'PAID';
};

const DATE = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * The page a reader meets when their entitlement runs out.
 *
 * It is a gate, not a wall: it always says what happened, how far they got,
 * and gives them both ways forward.
 */
export function Paywall({
  reason,
  book,
  trialEndsAt,
  pagesRead,
  signedIn = true,
}: {
  reason: AccessReason;
  book: Book;
  trialEndsAt?: Date | null;
  pagesRead?: number;
  signedIn?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const startTrial = async () => {
    setBusy(true);
    await fetch(`/api/books/${book.slug}/open`, { method: 'POST' });
    router.refresh();
  };

  const buy = (
    <Link className="btn btn--primary" href={`/checkout/book/${book.slug}`}>
      Buy this book — {formatRwf(book.priceRwf)}
    </Link>
  );

  const subscribe = (
    <Link className="btn btn--quiet" href="/subscribe">
      Or read everything — ${PLANS.YEARLY.usd} a year
    </Link>
  );

  let heading: string;
  let body: React.ReactNode;
  let actions: React.ReactNode;

  if (reason === 'TRIAL_AVAILABLE') {
    heading = 'Your free week starts when you open this book.';
    body = (
      <p>
        Seven days with <em>{book.title}</em>, from the moment you begin — not from the day it was
        published. After that you can keep it, or subscribe and keep everything.
      </p>
    );
    actions = (
      <button className="btn btn--primary" type="button" onClick={startTrial} disabled={busy}>
        {busy ? 'Opening…' : 'Start my free week'}
      </button>
    );
  } else if (reason === 'TRIAL_EXPIRED') {
    heading = 'Your free week has ended.';
    body = (
      <>
        <p>
          Your seven days with <em>{book.title}</em> are up
          {trialEndsAt ? ` — the window closed on ${DATE(trialEndsAt)}` : ''}.
        </p>
        <p>
          Buying this book keeps it for good. Subscribing opens this one and every other book Agati
          has, which is the cheaper way in if you plan to read more than four.
        </p>
      </>
    );
    actions = (
      <>
        {buy}
        {subscribe}
      </>
    );
  } else if (!signedIn) {
    heading = 'Sign in to keep reading.';
    body = (
      <p>
        <em>{book.title}</em> is free for a week once you have an account — and an account also
        remembers where you stopped, on any device.
      </p>
    );
    actions = (
      <>
        <Link className="btn btn--primary" href={`/register?next=/read/${book.slug}`}>
          Create an account
        </Link>
        <Link className="btn btn--quiet" href={`/login?next=/read/${book.slug}`}>
          Sign in
        </Link>
      </>
    );
  } else {
    heading = `${book.title} is a paid title.`;
    body = (
      <p>
        You have read the opening. Agati&rsquo;s own books pay for the shelves, the crates and the
        fuel that carries them up the ridge roads.
      </p>
    );
    actions = (
      <>
        {buy}
        {subscribe}
      </>
    );
  }

  return (
    <section className="paywall">
      <p className="paywall__mark" aria-hidden="true">
        ❦
      </p>
      <h2 className="paywall__heading">{heading}</h2>
      <div className="paywall__body">{body}</div>

      {pagesRead ? <p className="paywall__read">You read {pagesRead} pages.</p> : null}

      <div className="paywall__actions">{actions}</div>

      <p className="paywall__back">
        <Link href={`/books/${book.slug}`}>← Back to the book</Link>
        {' · '}
        <Link href="/library?access=free">Free books</Link>
      </p>
    </section>
  );
}
