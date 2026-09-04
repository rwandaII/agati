import type { ReactNode } from 'react';

/** One two-page spread: left page, right page, and the gutter between them. */
export function Spread({
  left,
  right,
  running,
  folio,
}: {
  left: ReactNode;
  right: ReactNode;
  running: string;
  folio: number;
}) {
  return (
    <div className="spread">
      <section className="page page--left">
        <header className="page__running">{running}</header>
        <div className="page__body">{left}</div>
        <footer className="page__folio page__folio--left">{folio}</footer>
      </section>

      <section className="page page--right" id="page-content">
        <header className="page__running">{running}</header>
        <div className="page__body">{right}</div>
        <footer className="page__folio page__folio--right">{folio + 1}</footer>
      </section>

      <div className="spread__gutter" aria-hidden="true" />
    </div>
  );
}
