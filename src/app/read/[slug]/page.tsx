import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/auth/guards';
import { loadAccess } from '@/lib/access/queries';
import { Reader } from '@/components/reader/Reader';
import { ReaderGate } from '@/components/reader/ReaderGate';
import { formatRwf } from '@/config/pricing';

const INITIAL = 8;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await prisma.book.findUnique({
    where: { slug },
    select: { title: true, summary: true },
  });
  if (!book) return { title: 'Not found' };
  return { title: `Reading ${book.title}`, description: book.summary };
}

function badgeFor(book: { accessType: string; priceRwf: number }): string {
  if (book.accessType === 'FREE_FOREVER') return 'Free to read';
  if (book.accessType === 'FREE_TRIAL') return 'Free for 7 days';
  return formatRwf(book.priceRwf);
}

export default async function ReadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const book = await prisma.book.findUnique({ where: { slug } });
  if (!book) notFound();

  const user = await currentUser();
  const access = await loadAccess(user?.id ?? null, book);

  const progress = user
    ? await prisma.readingProgress.findUnique({
        where: { userId_bookId: { userId: user.id, bookId: book.id } },
      })
    : null;

  // The ceiling is applied in the query itself, so page text the reader has not
  // earned is never loaded into this component's props, let alone the HTML.
  const ceiling = access.canRead ? INITIAL - 1 : access.previewPages - 1;

  const pages = await prisma.bookPage.findMany({
    where: { bookId: book.id, index: { lte: ceiling } },
    orderBy: { index: 'asc' },
    select: { index: true, content: true, image: true },
  });

  return (
    <ReaderGate
      slug={book.slug}
      title={book.title}
      author={book.author}
      coverColor={book.coverColor}
      coverImage={book.coverImage}
      category={book.category}
      badge={badgeFor(book)}
    >
      <Reader
        book={{
          slug: book.slug,
          title: book.title,
          author: book.author,
          priceRwf: book.priceRwf,
          accessType: book.accessType,
          pageCount: book.pageCount,
          format: book.format,
        }}
        pages={pages}
        canRead={access.canRead}
        reason={access.reason}
        previewPages={access.previewPages}
        trialEndsAt={access.trialEndsAt ? access.trialEndsAt.toISOString() : null}
        startPage={progress?.pageIndex ?? 0}
        signedIn={Boolean(user)}
      />
    </ReaderGate>
  );
}
