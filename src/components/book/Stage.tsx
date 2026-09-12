'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useStage, type Stage as StageValue } from './useStage';

/** Two pages the right way up: what a desk gives, and what the server renders. */
const WIDE: StageValue = { leaves: 2, turned: false };

const StageContext = createContext<StageValue>(WIDE);

/**
 * The box everything is played on.
 *
 * It wraps the whole application rather than one route, for two reasons. A
 * phone that has been turned should stay turned when the reader closes a book
 * and steps back out to the shelf — the screen does not un-rotate itself
 * between pages of the same site. And the website is a book too: it wants the
 * same spread, on the same turned glass, as the volume you take off its shelf.
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
 * How the book is laid out, for the parts that must count in it rather than
 * merely be styled by it. Falls back to a desk, so anything rendered outside
 * the stage still gets a sensible answer instead of an error.
 */
export function useStageValue(): StageValue {
  return useContext(StageContext);
}
