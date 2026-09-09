'use client';

import { useEffect, useState } from 'react';

/** Below this the book shows one page at a time, as a paperback does. */
const ONE_UP = '(max-width: 780px)';

/**
 * How many pages of the book are open at once.
 *
 * A phone cannot hold a two-page spread at a readable size, so it shows one
 * page and turns one page. This has to be a number the reader works in rather
 * than something CSS hides, or half the book would never be shown at all.
 *
 * Two during the server render, matching the wide layout, then corrected on
 * the first paint — a phone briefly laying out two pages is invisible, whereas
 * guessing wrong in the markup would be a hydration mismatch.
 */
export function useLeavesShown(): 1 | 2 {
  const [leaves, setLeaves] = useState<1 | 2>(2);

  useEffect(() => {
    const query = window.matchMedia(ONE_UP);
    const apply = () => setLeaves(query.matches ? 1 : 2);

    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  return leaves;
}
