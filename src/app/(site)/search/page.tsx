import type { Metadata } from 'next';
import Link from 'next/link';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Heading, Scroller } from '@/components/ui/Prose';
import { SearchBox } from '@/components/ui/SearchBox';
import { search, type SearchHit } from '@/lib/search';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search every book, story and programme at Agati Library.',
};

type Search = { [k: string]: string | string[] | undefined };

function HitList({ hits }: { hits: SearchHit[] }) {
  return (
    <ul className="hits">
      {hits.map((h) => (
        <li key={h.href} className="hits__item">
          <Link className="hits__title" href={h.href}>
            {h.title}
          </Link>
          {h.badge ? <span className="badge badge--quiet">{h.badge}</span> : null}
          <p className="hits__snippet">{h.snippet}</p>
        </li>
      ))}
    </ul>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? '';
  const r = await search(q);

  return (
    <Spread
      running="Search"
      folio={14}
      left={
        <Scroller>
          <PageTitle kicker="Find anything">Search</PageTitle>
          <SearchBox defaultValue={q} />

          {q ? (
            <p className="filters__count">
              {r.total} {r.total === 1 ? 'result' : 'results'} for “{q}”
            </p>
          ) : (
            <p>Search across every book, every story we have published, and every section.</p>
          )}

          {r.pages.length > 0 ? (
            <>
              <Heading>Sections</Heading>
              <HitList hits={r.pages} />
            </>
          ) : null}

          {r.news.length > 0 ? (
            <>
              <Heading>News</Heading>
              <HitList hits={r.news} />
            </>
          ) : null}
        </Scroller>
      }
      right={
        <Scroller>
          {q && r.total === 0 ? (
            <>
              <Heading>Nothing found</Heading>
              <p>
                Nothing matches “{q}”. Try a different word, or{' '}
                <Link href="/library">browse the whole collection</Link>.
              </p>
            </>
          ) : null}

          {r.books.length > 0 ? (
            <>
              <Heading>Books ({r.books.length})</Heading>
              <HitList hits={r.books} />
            </>
          ) : null}
        </Scroller>
      }
    />
  );
}
