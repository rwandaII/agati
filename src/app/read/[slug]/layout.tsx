import type { ReactNode } from 'react';
import { HomeTab } from '@/components/reader/HomeTab';

/**
 * Reading a book from the collection.
 *
 * A smaller bound volume on the desk, rather than the big book the website
 * itself is. Only the way home comes along: inside a book, a full row of
 * section tabs and card marks sits across the head of the page competing with
 * the words, and a reader who wants the website can get there in one tap.
 *
 * The turning stage this sits on belongs to the whole application, not to this
 * route — see `components/book/Stage`. Closing a book should not un-rotate the
 * phone on the way back to the shelf.
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
