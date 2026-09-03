import type { ReactNode } from 'react';

/**
 * Reading a book is the one place the book metaphor belongs.
 *
 * A bound volume on a dark desk: no site header, no footer, no page scroll —
 * nothing competing with the book. The `:has(.cover)` rule in book.css keeps
 * the whole thing at closed size until the cover swings open, so opening it and
 * settling into it are one movement.
 */
export default function ReadLayout({ children }: { children: ReactNode }) {
  return (
    <div className="book__viewport">
      <div className="desk">
        <div className="book">
          <div className="book__edges book__edges--left" aria-hidden="true" />
          <div className="book__edges book__edges--right" aria-hidden="true" />
          <div className="book__block">{children}</div>
          <div className="book__spine" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
