import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Heading, Scroller } from '@/components/ui/Prose';
import { accessBadge } from '@/components/library/BookCard';
import { getBook } from '@/lib/books';
import { prisma } from '@/lib/db';
import { formatRwf, PLANS } from '@/config/pricing';

const LANGUAGE_LABEL: Record<string, string> = {
  EN: 'English',
  FR: 'Français',
  RW: 'Kinyarwanda',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) return { title: 'Book not found' };

  return {
    title: book.title,
    description: book.summary,
    openGraph: { title: book.title, description: book.summary, type: 'book' },
  };
}

export default async function BookDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBook(slug);
  if (!book) notFound();

  const badge = accessBadge(book);

  // Only ever the opening page, which every visitor is allowed to see.
  const firstPage = await prisma.bookPage.findFirst({
    where: { bookId: book.id, index: 0 },
    select: { content: true },
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: book.author },
    description: book.summary,
    inLanguage: book.language,
    numberOfPages: book.pageCount,
    isAccessibleForFree: book.accessType === 'FREE_FOREVER',
    ...(book.priceRwf > 0
      ? {
          offers: {
            '@type': 'Offer',
            price: book.priceRwf,
            priceCurrency: 'RWF',
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Spread
        running={book.title}
        folio={10}
        left={
          <Scroller>
            <span
              className="detail__cover"
              style={{ '--cover': book.coverColor } as CSSProperties}
              aria-hidden="true"
            >
              <span className="detail__coverSpine" />
              <span className="detail__coverTitle">{book.title}</span>
              <span className="detail__coverAuthor">{book.author}</span>
            </span>

            <p className="detail__badges">
              <span className={`badge badge--${badge.tone}`}>{badge.label}</span>
              <span className="badge badge--quiet">{LANGUAGE_LABEL[book.language]}</span>
              <span className="badge badge--quiet">{book.category}</span>
              <span className="badge badge--quiet">{book.pageCount} pages</span>
            </p>

            <p className="detail__actions">
              <Link className="btn btn--primary" href={`/read/${book.slug}`}>
                {book.accessType === 'FREE_FOREVER'
                  ? 'Read this book'
                  : book.accessType === 'FREE_TRIAL'
                    ? 'Start your 7 free days'
                    : 'Read the opening'}
              </Link>

              {book.accessType !== 'FREE_FOREVER' ? (
                <>
                  <Link className="btn btn--quiet" href={`/checkout/book/${book.slug}`}>
                    Buy for {formatRwf(book.priceRwf)}
                  </Link>
                  <Link className="btn btn--quiet" href="/subscribe">
                    Or read everything — ${PLANS.YEARLY.usd} a year
                  </Link>
                </>
              ) : null}
            </p>

            <p className="detail__back">
              <Link href="/library">← Back to the collection</Link>
            </p>
          </Scroller>
        }
        right={
          <Scroller>
            <PageTitle kicker={book.author}>{book.title}</PageTitle>
            <p>{book.description}</p>

            <Heading>How it begins</Heading>
            <blockquote className="detail__excerpt">
              {(firstPage?.content ?? '').split(/\n\s*\n/).slice(0, 3).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </blockquote>
          </Scroller>
        }
      />
    </>
  );
}
