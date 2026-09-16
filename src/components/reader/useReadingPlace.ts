'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { anchorOfPage, pageAtAnchor, weigh } from '@/lib/reading/anchor';

/** Long enough that turning pages quickly doesn't post once per page. */
const SETTLE_MS = 1200;

const localKey = (slug: string) => `agati:place:${slug}`;

type Options = {
  slug: string;
  signedIn: boolean;
  isComic: boolean;
  /** The pages as currently laid out; re-flows as the screen and loading change. */
  display: string[];
  /** How many of the book's pages exist, and how many have arrived so far. */
  pageCount: number;
  loadedPages: number;
  /** The book's stored pages, whose numbering is the same on every screen. */
  storedText: string[];
  spread: number;
  setSpread: (n: number) => void;
  /** Where this reader left off. Only meaningful once `known` is true. */
  startAnchor: number;
  /** Whether the saved place has been looked up yet. */
  known: boolean;
  /** Whether the text has been laid out for this screen yet. */
  laidOut: boolean;
  /** Pages open at once: two on a spread, one on a phone. */
  leaves: 1 | 2;
};

/**
 * Picking a book up where it was put down.
 *
 * The place is kept as an anchor rather than a page number, so it survives the
 * text being reflowed for a different screen. See lib/reading/anchor.
 *
 * Restoring isn't a single jump. A book opens holding only its first few pages,
 * so a place deep inside it isn't reachable yet. The reader gets moved as far
 * towards it as the loaded pages allow, which puts them at the end, which is
 * what makes the reader fetch more. Each batch moves them further, and it stops
 * once the anchor is genuinely in hand.
 *
 * Nothing is saved until that has resolved. A reader is at page one for the
 * moment it takes to look their place up, and writing that down is the one bug
 * this whole file exists to prevent.
 */
export function useReadingPlace({
  slug,
  signedIn,
  isComic,
  display,
  pageCount,
  loadedPages,
  storedText,
  spread,
  setSpread,
  startAnchor,
  known,
  laidOut,
  leaves,
}: Options) {
  const [resumedAt, setResumedAt] = useState<number | null>(null);
  const phase = useRef<'waiting' | 'chasing' | 'settled'>('waiting');

  // nothing may be written until we know whether there's a place to go back to
  useEffect(() => {
    if (!known || phase.current !== 'waiting') return;
    phase.current = startAnchor > 0 ? 'chasing' : 'settled';
  }, [known, startAnchor]);

  /** Where the reader is now, in a form that survives a reflow. */
  const anchorNow = useCallback(
    (at: number) => (isComic ? at * leaves : anchorOfPage(display, at * leaves)),
    [display, isComic, leaves],
  );

  // --- restore ---
  useEffect(() => {
    // restoring against a pagination that's about to be replaced puts the
    // reader in the wrong place, and past the end once the real one arrives
    if (phase.current !== 'chasing' || !display.length || !laidOut) return;

    const target = isComic
      ? Math.floor(startAnchor / leaves)
      : Math.floor(pageAtAnchor(display, startAnchor) / leaves);

    setSpread(target);

    // have we actually got that far, or are we still parked at the end waiting
    // for the rest of the book?
    const inHand = isComic
      ? loadedPages > startAnchor
      : display.reduce((sum, page) => sum + weigh(page), 0) > startAnchor;

    if (inHand || loadedPages >= pageCount) {
      phase.current = 'settled';
      // hand the place straight to the keeper below, so it doesn't have to work
      // it out from a position that's still moving
      place.current = startAnchor;
      shown.current = { pages: display, leaves };
      setResumedAt(target * leaves + 1);
    }
  }, [display, startAnchor, isComic, loadedPages, pageCount, setSpread, laidOut, leaves]);

  // --- hold the place across a reflow ---
  // the pagination changes under the reader: first layout, a resize, a font
  // settling. Every change renumbers the pages, so a page number is not a
  // place. Keep the anchor and work the page out from it again.
  const place = useRef(0);
  const shown = useRef<{ pages: string[]; leaves: number } | null>(null);

  useEffect(() => {
    if (isComic || !laidOut) return;

    // while the chase is on it owns the position, anything else would be
    // holding a place it only reached because the book was still loading
    if (phase.current === 'chasing') {
      shown.current = { pages: display, leaves };
      return;
    }

    const laidOutDifferently =
      !shown.current || shown.current.pages !== display || shown.current.leaves !== leaves;

    if (laidOutDifferently) {
      shown.current = { pages: display, leaves };
      if (place.current > 0) {
        const target = Math.floor(pageAtAnchor(display, place.current) / leaves);
        if (target !== spread) {
          setSpread(target);
          return; // record the place once the move has landed
        }
      }
    }

    place.current = anchorOfPage(display, spread * leaves);
  }, [display, spread, isComic, laidOut, setSpread, leaves]);

  // --- save ---
  const write = useCallback(
    (beacon: boolean) => {
      if (phase.current !== 'settled' || !laidOut) return;

      const anchor = anchorNow(spread);
      const body = JSON.stringify({
        slug,
        anchor,
        // the shelf shows progress against the book's stored pages, which are
        // numbered the same however this screen lays them out
        pageIndex: isComic ? spread * leaves : pageAtAnchor(storedText, anchor),
      });

      // worth keeping for someone who hasn't signed in too, it just can't
      // follow them to another device
      try {
        localStorage.setItem(localKey(slug), String(anchor));
      } catch {
        /* private browsing, or storage off */
      }

      if (!signedIn) return;

      if (beacon && typeof navigator.sendBeacon === 'function') {
        // the tab is going away: a fetch would be cancelled, this won't be
        navigator.sendBeacon('/api/progress', new Blob([body], { type: 'application/json' }));
        return;
      }

      fetch('/api/progress', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    },
    [anchorNow, isComic, signedIn, slug, spread, storedText, laidOut, leaves],
  );

  useEffect(() => {
    const t = setTimeout(() => write(false), SETTLE_MS);
    return () => clearTimeout(t);
  }, [write]);

  // closing the tab, switching apps or locking a phone mustn't lose the page.
  // visibilitychange is the one event phones reliably deliver.
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === 'hidden') write(true);
    };
    document.addEventListener('visibilitychange', flush);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', flush);
      window.removeEventListener('pagehide', flush);
    };
  }, [write]);

  return {
    /** The page a reader was returned to, so it can be announced once. */
    resumedAt,
    dismissResume: useCallback(() => setResumedAt(null), []),
    anchorNow,
    startOver: useCallback(() => {
      phase.current = 'settled';
      setResumedAt(null);
      setSpread(0);
    }, [setSpread]),
  };
}

/** The place this browser remembers, for a reader who has not signed in. */
export function localAnchor(slug: string): number {
  try {
    return Number(localStorage.getItem(localKey(slug))) || 0;
  } catch {
    return 0;
  }
}
