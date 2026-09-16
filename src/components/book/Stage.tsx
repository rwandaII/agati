'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useStage, type Stage as StageValue } from './useStage';

/** Two pages the right way up. What a desk gives, and what the server renders. */
const WIDE: StageValue = { leaves: 2, turned: false };

const StageContext = createContext<StageValue>(WIDE);

/**
 * The box everything is played on.
 *
 * It wraps the whole app rather than one route for two reasons. A phone that
 * has been rotated should stay rotated when the reader closes a book and goes
 * back to the shelf. And the site is a book too, so it wants the same spread
 * on the same glass as the volume you take off the shelf.
 */
export function Stage({ children }: { children: ReactNode }) {
  const stage = useStage();

  return (
    <StageContext.Provider value={stage}>
      <div className="stage" id="book-stage">
        {children}
      </div>
    </StageContext.Provider>
  );
}

/**
 * How the book is laid out, for the parts that have to count in it rather than
 * just be styled by it. Falls back to a desk, so anything rendered outside the
 * stage still gets a sensible answer.
 */
export function useStageValue(): StageValue {
  return useContext(StageContext);
}
