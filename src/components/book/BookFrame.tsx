import type { ReactNode } from 'react';
import { Ribbons } from './Ribbons';

/** The desk, the book body, the page-edge stacks and the spine. */
export function BookFrame({ children }: { children: ReactNode }) {
  return (
    <div className="desk">
      <div className="book">
        <div className="book__edges book__edges--left" aria-hidden="true" />
        <div className="book__edges book__edges--right" aria-hidden="true" />
        <div className="book__block">{children}</div>
        <div className="book__spine" aria-hidden="true" />
        <Ribbons />
      </div>
    </div>
  );
}
