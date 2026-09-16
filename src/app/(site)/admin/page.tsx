import type { Metadata } from 'next';
import Link from 'next/link';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead, Heading, Scroller } from '@/components/ui/Prose';
import { requireAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';
import { formatRwf } from '@/config/pricing';

export const metadata: Metadata = { title: 'The admin desk', robots: { index: false } };

const ACCESS_LABEL: Record<string, string> = {
  FREE_FOREVER: 'Free forever',
  FREE_TRIAL: '7 days free',
  PAID: 'Paid',
};

export default async function Admin() {
  await requireAdmin();

  const [books, news, stats] = await Promise.all([
    prisma.book.findMany({
      orderBy: [{ accessType: 'asc' }, { title: 'asc' }],
      select: {
        id: true, slug: true, title: true, accessType: true,
        priceRwf: true, pageCount: true, language: true,
      },
    }),
    prisma.newsPost.findMany({
      orderBy: { publishedAt: 'desc' },
      select: { id: true, slug: true, title: true, category: true, publishedAt: true },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.purchase.count({ where: { status: 'SUCCEEDED' } }),
      prisma.subscription.count({ where: { status: 'ACTIVE', expiresAt: { gt: new Date() } } }),
    ]),
  ]);

  const [users, paid, subs] = stats;

  return (
    <Spread
      running="The Admin Desk"
      folio={26}
      left={
        <Scroller>
          <PageTitle kicker="Staff only">The Admin Desk</PageTitle>
          <Lead>
            Everything the library holds, and how each title earns. Only administrators can open
            this page.
          </Lead>

          <p className="admin__stats">
            <span>
              <strong>{books.length}</strong> books
            </span>
            <span>
              <strong>{users}</strong> readers
            </span>
            <span>
              <strong>{paid}</strong> purchases
            </span>
            <span>
              <strong>{subs}</strong> subscribers
            </span>
          </p>

          <Heading>Access types, and what they mean</Heading>
          <dl className="admin__legend">
            <dt>Free forever</dt>
            <dd>Anyone can read it in full. No account needed.</dd>
            <dt>7 days free</dt>
            <dd>
              A reader gets a week from the day <em>they</em> open it, then buys it or subscribes.
            </dd>
            <dt>Paid</dt>
            <dd>Preview only until bought, or opened with a subscription.</dd>
          </dl>

          <Heading>News</Heading>
          <ul className="admin__list">
            {news.map((n) => (
              <li key={n.id} className="admin__row">
                <span className="admin__title">{n.title}</span>
                <span className="admin__meta">
                  {n.category} · {n.publishedAt.toISOString().slice(0, 10)} ·{' '}
                  <Link href={`/news/${n.slug}`}>view</Link>
                </span>
              </li>
            ))}
          </ul>
        </Scroller>
      }
      right={
        <Scroller>
          <Heading>The collection</Heading>
          <ul className="admin__list">
            {books.map((b) => (
              <li key={b.id} className="admin__row">
                <span className="admin__title">{b.title}</span>
                <span className="admin__meta">
                  <span
                    className={`badge badge--${
                      b.accessType === 'FREE_FOREVER'
                        ? 'free'
                        : b.accessType === 'FREE_TRIAL'
                          ? 'trial'
                          : 'paid'
                    }`}
                  >
                    {ACCESS_LABEL[b.accessType]}
                  </span>{' '}
                  {b.priceRwf > 0 ? `${formatRwf(b.priceRwf)} · ` : ''}
                  {b.pageCount} pages · {b.language} ·{' '}
                  <Link href={`/books/${b.slug}`}>view</Link>
                </span>
              </li>
            ))}
          </ul>

          <Heading>Adding books</Heading>
          <p className="account__note">
            Post to <code>/api/admin/books</code> with the book&rsquo;s details and its full text in
            a <code>text</code> field. It is paginated automatically. To change how a title earns,
            PATCH it with a new <code>accessType</code> and <code>priceRwf</code>. Bulk imports go
            through <code>scripts/fetch-books.ts</code>.
          </p>
        </Scroller>
      }
    />
  );
}
