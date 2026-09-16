import type { Metadata } from 'next';
import Link from 'next/link';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Heading, Scroller } from '@/components/ui/Prose';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { formatRwf, PLANS } from '@/config/pricing';
import { LogoutButton } from '@/components/ui/LogoutButton';

export const metadata: Metadata = { title: 'Your account' };

const DATE = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function Account() {
  const user = await requireUser();

  const [subscription, purchases] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
      orderBy: { expiresAt: 'desc' },
    }),
    prisma.purchase.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { book: { select: { title: true, slug: true } } },
      take: 40,
    }),
  ]);

  const active = subscription && subscription.expiresAt > new Date();

  return (
    <Spread
      running="Your Account"
      folio={18}
      left={
        <Scroller>
          <PageTitle kicker={user.email}>{user.name}</PageTitle>

          <Heading>Subscription</Heading>
          {active ? (
            <>
              <p>
                <span className="badge badge--free">Active</span> on the{' '}
                {subscription.plan === 'YEARLY' ? 'yearly' : 'monthly'} plan. Every book in the
                library is open to you.
              </p>
              <p className="account__note">Runs until {DATE(subscription.expiresAt)}.</p>
            </>
          ) : (
            <>
              <p>You do not have a subscription.</p>
              <p>
                <Link className="btn btn--primary" href="/subscribe">
                  Read everything, ${PLANS.YEARLY.usd} a year
                </Link>
              </p>
            </>
          )}

          <Heading>Session</Heading>
          <LogoutButton />
        </Scroller>
      }
      right={
        <Scroller>
          <Heading>What you have bought</Heading>
          {purchases.length === 0 ? (
            <p>
              Nothing yet. <Link href="/library">The collection</Link> is full of books that cost
              nothing at all.
            </p>
          ) : (
            <ul className="account__list">
              {purchases.map((p) => (
                <li key={p.id} className="account__item">
                  <span className="account__what">
                    {p.kind === 'SUBSCRIPTION'
                      ? `Subscription: ${p.plan === 'YEARLY' ? 'one year' : 'one month'}`
                      : (p.book?.title ?? 'A book')}
                  </span>
                  <span className="account__meta">
                    {DATE(p.createdAt)} · {formatRwf(p.amountRwf)} ·{' '}
                    <span
                      className={`badge badge--${
                        p.status === 'SUCCEEDED' ? 'free' : p.status === 'PENDING' ? 'trial' : 'quiet'
                      }`}
                    >
                      {p.status === 'SUCCEEDED'
                        ? 'Paid'
                        : p.status === 'PENDING'
                          ? 'Waiting'
                          : 'Failed'}
                    </span>
                  </span>
                  {p.book && p.status === 'SUCCEEDED' ? (
                    <Link className="account__read" href={`/read/${p.book.slug}`}>
                      Read it →
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Scroller>
      }
    />
  );
}
