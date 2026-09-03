import type { Metadata } from 'next';
import Link from 'next/link';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead, Heading, Scroller } from '@/components/ui/Prose';
import { Plate } from '@/components/ui/PhotoStrip';
import { SocialLinks } from '@/components/ui/SocialLinks';
import { WIDE } from '@/config/photos';
import { listNews, formatNewsDate } from '@/lib/news';

export const metadata: Metadata = {
  title: 'What We Have Done',
  description:
    'Milestones and activity from Agati Library: eight library spaces, the Mobile Library, Nge Nawe Dusome radio, the Writers Residency and more.',
};

export default async function News() {
  const posts = await listNews();
  const featured = posts.find((p) => p.featured) ?? posts[0];
  const rest = posts.filter((p) => p.slug !== featured?.slug);

  return (
    <Spread
      running="What We Have Done"
      folio={8}
      left={
        <Scroller>
          <PageTitle kicker="News &amp; milestones">What We Have Done</PageTitle>
          <Lead>
            Eight libraries, a crate of books on a motorcycle, children reading their own stories on
            the radio. This is the record.
          </Lead>

          {featured ? (
            <article className="news__featured">
              <p className="news__meta">
                {formatNewsDate(featured.publishedAt)} · {featured.category}
              </p>
              <h2 className="news__featuredTitle">
                <Link href={`/news/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <p>{featured.excerpt}</p>
              <p>
                <Link className="btn btn--quiet" href={`/news/${featured.slug}`}>
                  Read this
                </Link>
              </p>

              <Plate photo={WIDE} wide />
              <SocialLinks label="Follow the work" />
            </article>
          ) : (
            <p>Nothing published yet.</p>
          )}
        </Scroller>
      }
      right={
        <Scroller>
          <Heading>Everything else</Heading>
          <ol className="news__list">
            {rest.map((p) => (
              <li key={p.slug} className="news__item">
                <p className="news__meta">
                  {formatNewsDate(p.publishedAt)} · {p.category}
                </p>
                <h3 className="news__itemTitle">
                  <Link href={`/news/${p.slug}`}>{p.title}</Link>
                </h3>
                <p className="news__excerpt">{p.excerpt}</p>
              </li>
            ))}
          </ol>
        </Scroller>
      }
    />
  );
}
