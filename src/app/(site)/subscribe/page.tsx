import type { Metadata } from 'next';
import Link from 'next/link';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead, Heading, Scroller } from '@/components/ui/Prose';
import { PhoneForm } from '@/components/checkout/PhoneForm';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { PLANS, formatRwf } from '@/config/pricing';

export const metadata: Metadata = {
  title: 'Read everything',
  description: `Every book in the Agati collection for $${PLANS.YEARLY.usd} a year.`,
};

type Search = { [k: string]: string | string[] | undefined };

export default async function Subscribe({ searchParams }: { searchParams: Promise<Search> }) {
  const user = await requireUser();
  const sp = await searchParams;

  const wanted =
    (Array.isArray(sp.plan) ? sp.plan[0] : sp.plan) === 'MONTHLY' ? 'MONTHLY' : 'YEARLY';

  const active = await prisma.subscription.findFirst({
    where: { userId: user.id, status: 'ACTIVE', expiresAt: { gt: new Date() } },
  });

  const saving = PLANS.MONTHLY.rwf * 12 - PLANS.YEARLY.rwf;

  return (
    <Spread
      running="Read Everything"
      folio={22}
      left={
        <Scroller>
          <PageTitle kicker="One subscription">Read everything</PageTitle>
          <Lead>
            Every book Agati has, for as long as your subscription is active: the paid titles, the
            seven-day titles, and everything we add next.
          </Lead>

          <div className="plans">
            <div className={`plan ${wanted === 'YEARLY' ? 'plan--best' : ''}`}>
              <p className="plan__name">A year</p>
              <p className="plan__price">${PLANS.YEARLY.usd}</p>
              <p className="plan__rwf">{formatRwf(PLANS.YEARLY.rwf)}</p>
              <p className="plan__note">Best value, saves {formatRwf(saving)}</p>
              <Link className="btn btn--quiet" href="/subscribe?plan=YEARLY">
                Choose the year
              </Link>
            </div>

            <div className={`plan ${wanted === 'MONTHLY' ? 'plan--best' : ''}`}>
              <p className="plan__name">A month</p>
              <p className="plan__price">${PLANS.MONTHLY.usd}</p>
              <p className="plan__rwf">{formatRwf(PLANS.MONTHLY.rwf)}</p>
              <p className="plan__note">Stop whenever you like</p>
              <Link className="btn btn--quiet" href="/subscribe?plan=MONTHLY">
                Choose the month
              </Link>
            </div>
          </div>

          <p className="account__note">
            Prices are charged in Rwandan francs. A subscription runs until it expires and is not
            renewed automatically. Nothing is ever taken from you without asking.
          </p>
        </Scroller>
      }
      right={
        <Scroller>
          {active ? (
            <>
              <Heading>You already subscribe</Heading>
              <p>
                Your {active.plan === 'YEARLY' ? 'yearly' : 'monthly'} subscription runs until{' '}
                {active.expiresAt.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                .
              </p>
              <p>
                <Link className="btn btn--primary" href="/library">
                  Go and read something
                </Link>
              </p>
            </>
          ) : (
            <>
              <Heading>Pay with Mobile Money</Heading>
              <PhoneForm
                kind="subscription"
                plan={wanted}
                amountRwf={PLANS[wanted].rwf}
                label={
                  wanted === 'YEARLY'
                    ? 'One year of everything: '
                    : 'One month of everything: '
                }
              />
            </>
          )}
        </Scroller>
      }
    />
  );
}
