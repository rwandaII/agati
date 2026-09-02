'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { turnDuration } from './constants';

type Options = {
  onNext: () => void;
  onPrev: () => void;
  enabled?: boolean;
};

/**
 * Turns keyboard and horizontal swipe into page turns.
 *
 * The wheel is deliberately NOT bound. Scrolling belongs to the page content —
 * a long programme list or a shelf of books has to scroll normally — so turning
 * is an explicit action: the arrows, the arrow keys, or a sideways swipe.
 */
export function useFlip({ onNext, onPrev, enabled = true }: Options) {
  const [el, setEl] = useState<HTMLElement | null>(null);

  const locked = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);

  // Keep the latest callbacks without re-binding listeners on every render.
  const cb = useRef({ onNext, onPrev, enabled });
  cb.current = { onNext, onPrev, enabled };

  const fire = useCallback((dir: 1 | -1) => {
    if (!cb.current.enabled || locked.current) return;

    locked.current = true;
    if (dir === 1) cb.current.onNext();
    else cb.current.onPrev();

    setTimeout(() => {
      locked.current = false;
    }, turnDuration() + 90);
  }, []);

  const bind = useCallback((node: HTMLElement | null) => setEl(node), []);

  useEffect(() => {
    if (!el) return;

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
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

      // Sideways only. A vertical swipe is a scroll, and belongs to the page.
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) {
        fire(dx < 0 ? 1 : -1);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
  }, [el, fire]);

  return { bind, turn: fire };
}
