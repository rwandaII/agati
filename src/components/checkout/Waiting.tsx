'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatRwf } from '@/config/pricing';

const POLL_MS = 3000;
const GIVE_UP_MS = 3 * 60 * 1000;

type Phase = 'pending' | 'succeeded' | 'failed' | 'timeout';

/** The "approve it on your phone" screen. Polls until the charge resolves. */
export function Waiting({
  reference,
  amountRwf,
  what,
}: {
  reference: string;
  amountRwf: number;
  what: string;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('pending');
  const [bookSlug, setBookSlug] = useState<string | null>(null);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (phase !== 'pending') return;

    const id = setInterval(async () => {
      if (Date.now() - startedAt.current > GIVE_UP_MS) {
        setPhase('timeout');
        return;
      }

      try {
        const res = await fetch(`/api/checkout/${reference}/status`);
        if (!res.ok) return;

        const json = await res.json();
        if (json.bookSlug) setBookSlug(json.bookSlug);

        if (json.status === 'succeeded') {
          setPhase('succeeded');
          router.refresh();
        } else if (json.status === 'failed') {
          setPhase('failed');
        }
      } catch {
        /* dropped poll, keep waiting */
      }
    }, POLL_MS);

    return () => clearInterval(id);
  }, [phase, reference, router]);

  if (phase === 'succeeded') {
    return (
      <section className="waiting">
        <span className="seal" aria-hidden="true">
          ✓
        </span>
        <h2 className="paywall__heading">Paid. It is yours.</h2>
        <p>
          {formatRwf(amountRwf)} received for {what}.
        </p>
        <p className="paywall__actions">
          {bookSlug ? (
            <Link className="btn btn--primary" href={`/read/${bookSlug}`}>
              Start reading
            </Link>
          ) : (
            <Link className="btn btn--primary" href="/library">
              Open the library
            </Link>
          )}
          <Link className="btn btn--quiet" href="/account">
            See my account
          </Link>
        </p>
      </section>
    );
  }

  if (phase === 'failed' || phase === 'timeout') {
    return (
      <section className="waiting">
        <h2 className="paywall__heading">
          {phase === 'failed' ? 'That payment did not go through.' : 'We stopped waiting.'}
        </h2>
        <p>
          {phase === 'failed'
            ? 'Nothing was charged. It is safe to try again.'
            : 'The approval never arrived. If you did approve it on your phone, check your account in a moment, it may still land.'}
        </p>
        <p className="paywall__actions">
          <Link className="btn btn--primary" href="/library">
            Back to the library
          </Link>
          <Link className="btn btn--quiet" href="/account">
            Check my account
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="waiting">
      <span className="waiting__phone" aria-hidden="true">
        <span className="waiting__ring" />
        <span className="waiting__ring waiting__ring--2" />
        <span className="waiting__body" />
      </span>

      <h2 className="paywall__heading">Approve the payment on your phone.</h2>
      <p>
        We have asked for {formatRwf(amountRwf)} for {what}. A prompt should appear on your handset
        within a few seconds. Enter your Mobile Money PIN to confirm.
      </p>
      <p className="paywall__read">Waiting… this page updates itself. It can take up to a minute.</p>
    </section>
  );
}
