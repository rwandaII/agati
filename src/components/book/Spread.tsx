import type { ReactNode } from 'react';

/**
 * A website section laid out in two columns.
 *
 * This used to render an actual two-page book spread, and the whole site lived
 * inside a book. That was wrong: the book belongs to the books. Every page
 * still hands over a `left` and a `right`, so the pages themselves did not have
 * to change — but here it becomes an ordinary, scrollable section.
 */
export function Spread({
  left,
  right,
  running,
}: {
  left: ReactNode;
  right: ReactNode;
  running: string;
  /** Kept so the page components need no edit; a website has no folios. */
  folio?: number;
}) {
  return (
    <section className="section">
      <div className="wrap">
        <p className="eyebrow">{running}</p>
        <div className="columns">
          <div className="columns__col prose">{left}</div>
          <div className="columns__col prose">{right}</div>
        </div>
      </div>
    </section>
  );
}
