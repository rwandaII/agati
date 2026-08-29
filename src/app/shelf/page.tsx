import type { Metadata } from 'next';
import Link from 'next/link';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead, Heading, Scroller } from '@/components/ui/Prose';
import { requireUser } from '@/lib/auth/guards';
import { prisma } from '@/lib/db';

export const metadata: Metadata = { title: 'My shelf' };

export default async function Shelf() {
  const user = await requireUser();

  const progress = await prisma.readingProgress.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: { book: { select: { slug: true, title: true, author: true, pageCount: true, coverColor: true } } },
  });

  const owned = await prisma.purchase.findMany({
    where: { userId: user.id, kind: 'BOOK', status: 'SUCCEEDED' },
    include: { book: { select: { slug: true, title: true, author: true } } },
  });

  return (
    <Spread
      running="My Shelf"
      folio={20}
      left={
        <Scroller>
          <PageTitle kicker={user.name}>My Shelf</PageTitle>
          <Lead>Everything you are part way through, and everything that is yours to keep.</Lead>

          <Heading>Still reading</Heading>
          {progress.length === 0 ? (
            <p>
              Nothing open yet. <Link href="/library">Pick something</Link>.
            </p>
          ) : (
            <ul className="account__list">
              {progress.map((p) => {
                const pct = p.book.pageCount
                  ? Math.round(((p.pageIndex + 1) / p.book.pageCount) * 100)
                  : 0;
                return (
                  <li key={p.bookId} className="account__item">
                    <span className="account__what">{p.book.title}</span>
                    <span className="account__meta">
                      {p.book.author} · page {p.pageIndex + 1} of {p.book.pageCount} · {pct}%
                    </span>
                    <span className="progressbar" aria-hidden="true">
                      <span className="progressbar__fill" style={{ width: `${pct}%` }} />
                    </span>
                    <Link className="account__read" href={`/read/${p.book.slug}`}>
                      Continue reading →
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Scroller>
      }
      right={
        <Scroller>
          <Heading>Yours to keep</Heading>
          {owned.length === 0 ? (
            <p>
              You have not bought a book yet. Many titles cost nothing —{' '}
              <Link href="/library?access=free">see the free shelf</Link>.
            </p>
          ) : (
            <ul className="account__list">
              {owned.map((o) => (
                <li key={o.id} className="account__item">
                  <span className="account__what">{o.book?.title}</span>
                  <span className="account__meta">{o.book?.author}</span>
                  {o.book ? (
                    <Link className="account__read" href={`/read/${o.book.slug}`}>
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
