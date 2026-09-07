import type { ReactNode } from 'react';
import { Ribbons } from './Ribbons';

/**
 * The desk, the book body, the page-edge stacks and the spine.
 *
 * `accountMark` is a slot rather than an import: it is server-rendered (it reads
 * the session cookie) and this tree is client-side, so it has to be handed in.
 */
export function BookFrame({
  children,
  accountMark,
}: {
  children: ReactNode;
  accountMark?: ReactNode;
}) {
  return (
    <div className="desk">
      <div className="book">
        <div className="book__edges book__edges--left" aria-hidden="true" />
        <div className="book__edges book__edges--right" aria-hidden="true" />
        <div className="book__block">{children}</div>
        <div className="book__spine" aria-hidden="true" />
        <Ribbons />
        {accountMark}
      </div>
    </div>
  );
}
