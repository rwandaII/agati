import type { ReactNode } from 'react';

export function PageTitle({ children, kicker }: { children: ReactNode; kicker?: string }) {
  return (
    <hgroup className="prose__head">
      {kicker ? <p className="prose__kicker">{kicker}</p> : null}
      <h1 className="prose__title">{children}</h1>
    </hgroup>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="prose__lead">{children}</p>;
}

export function Heading({ children }: { children: ReactNode }) {
  return <h2 className="prose__h2">{children}</h2>;
}

export function Rule() {
  return <hr className="prose__rule" />;
}

/** A page region that may exceed the page box and needs its own scrollbar. */
export function Scroller({ children }: { children: ReactNode }) {
  return <div className="prose__scroll">{children}</div>;
}
