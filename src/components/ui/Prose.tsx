import type { ReactNode } from 'react';

export function PageTitle({ children, kicker }: { children: ReactNode; kicker?: string }) {
  return (
    <hgroup>
      {kicker ? <p className="eyebrow">{kicker}</p> : null}
      <h1 className="h1">{children}</h1>
    </hgroup>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="lead">{children}</p>;
}

export function Heading({ children }: { children: ReactNode }) {
  return <h2 className="h2">{children}</h2>;
}

export function Rule() {
  return <hr className="rule" />;
}

/** Was a scroll box inside a page; on a website the page itself scrolls. */
export function Scroller({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
