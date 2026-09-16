import type { ReactNode } from 'react';
import { HomeTab } from '@/components/reader/HomeTab';

/**
 * A book from the collection, as its own smaller volume rather than the big
 * book the site itself is. Only the way home comes with it: a full row of
 * section tabs across the head of the page competes with the words.
 *
 * The stage this sits on belongs to the whole app (components/book/Stage), not
 * to this route. Closing a book shouldn't un-rotate the phone on the way back
 * to the shelf.
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
          <HomeTab />
        </div>
      </div>
    </div>
  );
}
