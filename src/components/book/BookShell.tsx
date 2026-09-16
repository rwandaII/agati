'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BookFrame } from './BookFrame';
import { Leaf } from './Leaf';
import { useFlip } from './useFlip';
import { turnDuration } from './constants';
import { PAGES, pageIndex } from '@/config/site';

type Turn = { dir: 1 | -1; from: ReactNode; to: ReactNode };

/**
 * Wraps every route in the book and turns a page whenever the route changes.
 *
 * Mid-turn the pages underneath are a composite: going forward, the left half
 * still shows the outgoing spread while the right half already shows the
 * incoming one.
 */
export function BookShell({
  children,
  accountMark,
}: {
  children: ReactNode;
  accountMark?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // latest children, without making the turn effect depend on them
  const latest = useRef<ReactNode>(children);
  latest.current = children;

  const [shown, setShown] = useState<{ key: string; node: ReactNode }>({
    key: pathname,
    node: children,
  });
  const [turn, setTurn] = useState<Turn | null>(null);

  const shownRef = useRef(shown);
  shownRef.current = shown;

  useEffect(() => {
    const prev = shownRef.current;

    if (pathname === prev.key) {
      setShown({ key: pathname, node: latest.current });
      return;
    }

    const from = pageIndex(prev.key);
    const to = pageIndex(pathname);
    // pages outside the book's spine (a reader, a checkout) turn forward
    const dir: 1 | -1 = to === -1 || from === -1 || to >= from ? 1 : -1;

    const incoming = latest.current;
    setTurn({ dir, from: prev.node, to: incoming });

    const timer = setTimeout(() => {
      setShown({ key: pathname, node: incoming });
      setTurn(null);
    }, turnDuration());

    return () => clearTimeout(timer);
    // keyed on pathname only: `children` gets a new identity every render, and
    // re-running on that restarts the turn halfway through
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const go = (step: 1 | -1) => {
    const i = pageIndex(pathname);
    if (i === -1) return; // not a spine page; the reader handles its own turning
    const next = i + step;
    if (next < 0 || next >= PAGES.length) return;
    router.push(PAGES[next].href);
  };

  const { bind } = useFlip({
    onNext: () => go(1),
    onPrev: () => go(-1),
    enabled: !turn,
  });

  return (
    <div ref={bind} className="book__viewport">
      <BookFrame accountMark={accountMark}>
        {turn ? (
          <>
            <div className="book__under book__under--left">
              {turn.dir === 1 ? turn.from : turn.to}
            </div>
            <div className="book__under book__under--right">
              {turn.dir === 1 ? turn.to : turn.from}
            </div>
            <Leaf dir={turn.dir} front={turn.from} back={turn.to} />
          </>
        ) : (
          shown.node
        )}
      </BookFrame>
    </div>
  );
}
