'use client';

import { useEffect, useState } from 'react';
import { isPhoneStage, leavesFor, shouldTurn, stageOf } from './geometry';
import { releaseTheScreen } from './screen';

export type Stage = {
  /** How many pages of the book are open at once. */
  leaves: 1 | 2;
  /** Whether the book is being drawn a quarter-turn clockwise. */
  turned: boolean;
};

/**
 * Two during the server render, matching the wide layout. A phone briefly
 * laying out two pages is invisible, whereas guessing wrong in the markup
 * would be a hydration mismatch.
 */
const WIDE: Stage = { leaves: 2, turned: false };

/** How long the turn takes, plus a moment. Must match `stage-turn` in book.css. */
const TURN_SETTLES_IN = 940;

const same = (a: Stage, b: Stage) => a.leaves === b.leaves && a.turned === b.turned;

/**
 * The box the book is played on, and the shape it takes to fill it.
 *
 * One place decides this, because three things have to agree about it: the
 * reader counts pages in it, the swipe and the pen measure against it, and the
 * stylesheet dresses it. So the answer is published on the document — as
 * `data-leaves`, `data-turn` and `data-stage` — and CSS reads it there rather
 * than asking the viewport a second question and getting a different answer.
 *
 * It is a question CSS could not answer alone anyway: under a turned book the
 * media queries still see an upright phone.
 */
export function useStage(): Stage {
  const [stage, setStage] = useState<Stage>(WIDE);

  useEffect(() => {
    const root = document.documentElement;

    // A closed volume lying on its side is a book knocked over, not a book
    // opened. The turn belongs to the tap: the moment the cover starts to
    // swing, this stops matching and the frame comes round with it.
    //
    // The cover is put up by an effect of its own, and a child's effect has
    // already run by the time this one does — but the render it schedules has
    // not been committed yet, so on the very first pass the cover is not in
    // the DOM to be found. Deciding then would turn the book before its cover
    // had appeared, and turn it back a frame later. So the first frame is
    // always treated as covered, and the real answer waited for.
    let arrived = false;
    const covered = () =>
      !arrived || Boolean(document.querySelector('.cover:not(.cover--opening)'));

    // While the book is coming round, it is the only thing that should be
    // moving. Everything else the opening sets going — the volume growing out
    // of its cover, the desk lifting, the words settling onto the page — is
    // laid out or filtered rather than merely moved, and doing all of it at
    // once is what makes the turn stutter. This flag stands them down for the
    // length of the turn; the stylesheet says which.
    let wasTurned = false;
    let settling: ReturnType<typeof setTimeout> | undefined;

    const decide = () => {
      const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
      const turned =
        !covered() && shouldTurn(window.innerWidth, window.innerHeight, coarse);
      const box = stageOf(window.innerWidth, window.innerHeight, turned);
      const next: Stage = { leaves: leavesFor(box.width, box.height), turned };

      root.dataset.leaves = String(next.leaves);
      if (turned) {
        root.dataset.turn = '90';
        // How far back the turn has to stand for a screen's width to hold its
        // own height. CSS cannot divide one length by another, so the stage
        // measures it here and the keyframe spends it.
        root.style.setProperty(
          '--turn-scale',
          String(Math.min(window.innerWidth, window.innerHeight) / Math.max(window.innerWidth, window.innerHeight)),
        );
      } else {
        delete root.dataset.turn;
        root.style.removeProperty('--turn-scale');
      }

      if (turned && !wasTurned) {
        root.dataset.turning = '';
        clearTimeout(settling);
        settling = setTimeout(() => delete root.dataset.turning, TURN_SETTLES_IN);
      }
      wasTurned = turned;
      if (isPhoneStage(box)) root.dataset.stage = 'phone';
      else delete root.dataset.stage;

      setStage((current) => (same(current, next) ? current : next));
    };

    decide();

    // ...which is this: one frame on, the page is as it means to be, and a
    // book with no cover over it — a reader who came straight to a page —
    // can be turned at once.
    const settle = requestAnimationFrame(() => {
      arrived = true;
      decide();
    });

    // The cover opening is a class change on an element the reader does not
    // own, so it is watched for rather than waited on.
    const watch = new MutationObserver(decide);
    watch.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['class'],
    });

    window.addEventListener('resize', decide);
    window.addEventListener('orientationchange', decide);
    screen.orientation?.addEventListener?.('change', decide);

    return () => {
      cancelAnimationFrame(settle);
      clearTimeout(settling);
      delete root.dataset.turning;
      watch.disconnect();
      window.removeEventListener('resize', decide);
      window.removeEventListener('orientationchange', decide);
      screen.orientation?.removeEventListener?.('change', decide);

      delete root.dataset.leaves;
      delete root.dataset.turn;
      delete root.dataset.stage;
      root.style.removeProperty('--turn-scale');
      releaseTheScreen();
    };
  }, []);

  return stage;
}
