'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { WHEEL_THRESHOLD, turnDuration } from './constants';

type Options = {
  onNext: () => void;
  onPrev: () => void;
  enabled?: boolean;
};

/**
 * Turns wheel, keyboard and touch input into discrete page turns.
 *
 * The accumulator is the important part: a trackpad fires dozens of wheel
 * events per flick, and without tallying them into one turn the book riffles
 * uncontrollably. One gesture must equal one page.
 */
export function useFlip({ onNext, onPrev, enabled = true }: Options) {
  const [el, setEl] = useState<HTMLElement | null>(null);

  const acc = useRef(0);
  const locked = useRef(false);
  const decayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // Keep the latest callbacks without re-binding listeners on every render.
  const cb = useRef({ onNext, onPrev, enabled });
  cb.current = { onNext, onPrev, enabled };

  const fire = useCallback((dir: 1 | -1) => {
    if (!cb.current.enabled || locked.current) return;

    locked.current = true;
    acc.current = 0;

    if (dir === 1) cb.current.onNext();
    else cb.current.onPrev();

    setTimeout(() => {
      locked.current = false;
    }, turnDuration() + 90);
  }, []);

  const bind = useCallback((node: HTMLElement | null) => setEl(node), []);

  useEffect(() => {
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!cb.current.enabled) return;
      e.preventDefault();
      if (locked.current) return;

      // A flick in the opposite direction restarts the tally.
      if (acc.current !== 0 && Math.sign(e.deltaY) !== Math.sign(acc.current)) acc.current = 0;
      acc.current += e.deltaY;

      if (decayTimer.current) clearTimeout(decayTimer.current);
      decayTimer.current = setTimeout(() => {
        acc.current = 0;
      }, 220);

      if (Math.abs(acc.current) >= WHEEL_THRESHOLD) fire(acc.current > 0 ? 1 : -1);
    };

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        fire(1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        fire(-1);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touch.current) return;
      const dx = e.changedTouches[0].clientX - touch.current.x;
      const dy = e.changedTouches[0].clientY - touch.current.y;
      touch.current = null;

      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) fire(dx < 0 ? 1 : -1);
      else if (Math.abs(dy) > 60) fire(dy < 0 ? 1 : -1);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
      if (decayTimer.current) clearTimeout(decayTimer.current);
    };
  }, [el, fire]);

  return { bind };
}
