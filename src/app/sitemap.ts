import type { MetadataRoute } from 'next';
import { listBooks } from '@/lib/books';
import { listNews } from '@/lib/news';
import { PAGES } from '@/config/site';

const base = () => (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/**
 * Built per request, not at deploy time. The catalogue grows through the admin
 * pages long after a deploy, and building it here would also make the deploy
 * depend on the database being up.
 */
export const dynamic = 'force-dynamic';

/** Paid books are listed too. A book has to be findable before it's readable. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const root = base();

  // the fixed pages are worth listing even if the catalogue can't be read
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
