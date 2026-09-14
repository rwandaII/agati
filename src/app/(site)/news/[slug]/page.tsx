import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead, Scroller } from '@/components/ui/Prose';
import { getNews, listNews, formatNewsDate } from '@/lib/news';

/**
 * Which posts to build ahead of time. This runs during the deploy, before the
 * site is serving anything, so it is the one place where an unreachable
 * database would take the whole build down with it. Posts left out here are
 * still rendered on demand, so an empty list costs a little speed, not a page.
 */
export async function generateStaticParams() {
  try {
    return (await listNews()).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNews(slug);
  if (!post) return { title: 'Not found' };

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: 'article' },
  };
}

export default async function NewsPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getNews(slug);
  if (!post) notFound();

  const paragraphs = post.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const half = Math.ceil(paragraphs.length / 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt.toISOString(),
    author: { '@type': 'Organization', name: post.author },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Spread
        running="What We Have Done"
        folio={8}
        left={
          <Scroller>
            <p className="news__meta">
              {formatNewsDate(post.publishedAt)} · {post.category}
            </p>
            <PageTitle>{post.title}</PageTitle>
            {paragraphs.slice(0, 1).map((p, i) => (
              <Lead key={i}>{p}</Lead>
            ))}
            {paragraphs.slice(1, half).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Scroller>
        }
        right={
          <Scroller>
            {paragraphs.slice(half).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="detail__back">
              <Link href="/news">← Back to the news</Link>
            </p>
          </Scroller>
        }
      />
    </>
  );
}
