import type { ReactNode } from 'react';
import { Ribbons } from '@/components/book/Ribbons';
import { AccountRibbon } from '@/components/book/AccountRibbon';

/**
 * Reading a book from the collection.
 *
 * A smaller bound volume on the desk, rather than the big book the website
 * itself is. The section tabs and the card marks come along so a reader is
 * never stranded inside a book with no way back to Home — they appear once the
 * cover is open, since a closed book has nothing to navigate.
 */
export default function ReadLayout({ children }: { children: ReactNode }) {
  return (
    <div className="book__viewport book__viewport--reading">
      <div className="desk">
        <div className="book">
          <div className="book__edges book__edges--left" aria-hidden="true" />
          <div className="book__edges book__edges--right" aria-hidden="true" />
          <div className="book__block">{children}</div>
          <div className="book__spine" aria-hidden="true" />
          <Ribbons />
          <AccountRibbon />
        </div>
      </div>
    </div>
  );
}
