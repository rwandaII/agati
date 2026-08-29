import { prisma } from './db';
import { PAGES } from '@/config/site';
import { formatRwf } from '@/config/pricing';

export type SearchHit = {
  kind: 'book' | 'news' | 'page';
  title: string;
  href: string;
  snippet: string;
  badge?: string;
};

export type SearchResult = {
  books: SearchHit[];
  news: SearchHit[];
  pages: SearchHit[];
  total: number;
};

function badgeFor(b: { accessType: string; priceRwf: number }): string {
  if (b.accessType === 'FREE_FOREVER') return 'Free';
  if (b.accessType === 'FREE_TRIAL') return '7 days free';
  return formatRwf(b.priceRwf);
}

/**
 * Searches everything a visitor could be looking for: free books, paid books,
 * news and the static sections.
 *
 * Access is deliberately NOT a filter. A paid book must be findable — it just
 * is not readable until it has been paid for.
 */
export async function search(raw: string): Promise<SearchResult> {
  const q = (raw ?? '').trim();
  if (!q) return { books: [], news: [], pages: [], total: 0 };

  const [books, news] = await Promise.all([
    prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { author: { contains: q } },
          { summary: { contains: q } },
          { description: { contains: q } },
          { category: { contains: q } },
        ],
      },
      select: { slug: true, title: true, summary: true, accessType: true, priceRwf: true },
      orderBy: [{ featured: 'desc' }, { title: 'asc' }],
      take: 24,
    }),
    prisma.newsPost.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { excerpt: { contains: q } },
          { body: { contains: q } },
          { category: { contains: q } },
        ],
      },
      select: { slug: true, title: true, excerpt: true },
      orderBy: { publishedAt: 'desc' },
      take: 12,
    }),
  ]);

  const needle = q.toLowerCase();
  const pages: SearchHit[] = PAGES.filter(
    (p) =>
      p.label.toLowerCase().includes(needle) || p.running.toLowerCase().includes(needle),
  ).map((p) => ({ kind: 'page', title: p.label, href: p.href, snippet: p.running }));

  const bookHits: SearchHit[] = books.map((b) => ({
    kind: 'book',
    title: b.title,
    href: `/books/${b.slug}`,
    snippet: b.summary,
    badge: badgeFor(b),
  }));

  const newsHits: SearchHit[] = news.map((n) => ({
    kind: 'news',
    title: n.title,
    href: `/news/${n.slug}`,
    snippet: n.excerpt,
  }));

  return {
    books: bookHits,
    news: newsHits,
    pages,
    total: bookHits.length + newsHits.length + pages.length,
  };
}
