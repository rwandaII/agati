import type { MetadataRoute } from 'next';
import { listBooks } from '@/lib/books';
import { listNews } from '@/lib/news';
import { PAGES } from '@/config/site';

const base = () => (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/**
 * Built on request, not at deploy time. The catalogue grows through the admin
 * pages long after a deploy, so a sitemap frozen at build time would keep
 * pointing at yesterday's shelf — and a database briefly out of reach during a
 * deploy would take the whole build down with it.
 */
export const dynamic = 'force-dynamic';

/**
 * Everything a visitor arriving from a search engine should be able to reach.
 * Paid books are listed too: a book must be findable even before it is readable.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root = base();

  // The fixed pages are worth listing even when the catalogue cannot be read.
  const [books, news] = await Promise.all([
    listBooks({}).catch(() => []),
    listNews().catch(() => []),
  ]);

  return [
    ...PAGES.map((p) => ({
      url: `${root}${p.href}`,
      changeFrequency: 'monthly' as const,
      priority: p.href === '/' ? 1 : 0.8,
    })),
    { url: `${root}/search`, changeFrequency: 'monthly' as const, priority: 0.5 },
    ...books.map((b) => ({
      url: `${root}/books/${b.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...news.map((n) => ({
      url: `${root}/news/${n.slug}`,
      lastModified: n.publishedAt,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ];
}
