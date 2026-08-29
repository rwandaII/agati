import type { Metadata } from 'next';
import Link from 'next/link';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead, Heading, Scroller } from '@/components/ui/Prose';
import { BookCard } from '@/components/library/BookCard';
import { listBooks, categories, type BookFilter } from '@/lib/books';

export const metadata: Metadata = {
  title: 'The Collection',
  description:
    'Every book Agati Library has, readable online. Free titles, seven-day titles and Agati originals in English, French and Kinyarwanda.',
};

type Search = { [k: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const LANGS = [
  ['', 'All languages'],
  ['EN', 'English'],
  ['FR', 'Français'],
  ['RW', 'Kinyarwanda'],
] as const;

const ACCESS = [
  ['', 'Everything'],
  ['free', 'Free forever'],
  ['paid', 'Paid & 7-day'],
] as const;

export default async function Library({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;

  const filter: BookFilter = {
    q: one(sp.q),
    language: one(sp.language) as BookFilter['language'],
    category: one(sp.category),
    access: one(sp.access) as BookFilter['access'],
  };

  const [books, cats] = await Promise.all([listBooks(filter), categories()]);
  const active = Boolean(filter.q || filter.language || filter.category || filter.access);

  return (
    <Spread
      running="The Collection"
      folio={10}
      left={
        <Scroller>
          <PageTitle kicker="The collection">The Library</PageTitle>
          <Lead>
            Everything Agati has, readable here, one page at a time. Some books are free forever.
            Others are yours free for a week.
          </Lead>

          {/* A plain GET form, so filtering works with JavaScript switched off. */}
          <form className="filters" method="get" action="/library">
            <label className="filters__field">
              <span>Search</span>
              <input type="search" name="q" defaultValue={filter.q ?? ''} placeholder="Title, author…" />
            </label>

            <label className="filters__field">
              <span>Language</span>
              <select name="language" defaultValue={filter.language ?? ''}>
                {LANGS.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>

            <label className="filters__field">
              <span>Category</span>
              <select name="category" defaultValue={filter.category ?? ''}>
                <option value="">All categories</option>
                {cats.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className="filters__field">
              <span>Access</span>
              <select name="access" defaultValue={filter.access ?? ''}>
                {ACCESS.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </label>

            <div className="filters__actions">
              <button type="submit" className="btn btn--primary">Filter</button>
              {active ? <Link className="btn btn--quiet" href="/library">Clear</Link> : null}
            </div>
          </form>

          <p className="filters__count">
            {books.length} {books.length === 1 ? 'book' : 'books'}
            {active ? ' match your filter' : ' on the shelf'}
          </p>
        </Scroller>
      }
      right={
        <Scroller>
          {books.length === 0 ? (
            <>
              <Heading>Nothing on this shelf</Heading>
              <p>
                No book matches that. <Link href="/library">Show everything</Link> instead.
              </p>
            </>
          ) : (
            <div className="shelf">
              {books.map((b) => (
                <BookCard key={b.slug} book={b} />
              ))}
            </div>
          )}
        </Scroller>
      }
    />
  );
}
