'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { displayLines } from './lines';
import type { Measurer } from '@/lib/reader/paginate';

/**
 * Builds a Measurer from a hidden clone of the real page box, so pagination
 * uses the exact font, width and line-height the reader will see — and
 * repaginates correctly when the window is resized or the webfont lands.
 */
export function useMeasurer(pageRef: RefObject<HTMLElement | null>) {
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const ghost = document.createElement('div');
    ghost.setAttribute('aria-hidden', 'true');
    // A page opens with a drop capital, which is two or three lines tall and
    // pushes the text around it. Measuring without one fits a line more than
    // the page can hold, and that line is clipped at the foot.
    ghost.className = 'ghost';
    Object.assign(ghost.style, {
      position: 'absolute',
      visibility: 'hidden',
      pointerEvents: 'none',
      left: '-99999px',
      top: '0',
    });
    document.body.appendChild(ghost);
    ghostRef.current = ghost;

    const sync = () => {
      const textBox = (page.querySelector('.page__body') as HTMLElement | null) ?? page;
      const cs = getComputedStyle(textBox);

      // Measured in the page's own axes, not the screen's: on a phone the book
      // is drawn turned, and a bounding rect would then report the column's
      // height as its width and paginate the book into ribbons.
      //
      // And measured to the text's own width, not the column's. The ghost has
      // no padding, so giving it the padded width lets it fit a little more on
      // every line than the page can — which is a line too many at the foot of
      // the page, showing as a row of clipped letter-tops.
      const width =
        textBox.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const height = textBox.clientHeight;
      if (width <= 0 || height === 0) return;

      ghost.style.width = `${width}px`;
      for (const prop of [
        'fontFamily',
        'fontSize',
        'lineHeight',
        'letterSpacing',
        'fontWeight',
        'textAlign',
      ] as const) {
        ghost.style[prop] = cs[prop];
      }

      setBox({ width, height });
      setReady(true);
    };

    sync();

    /**
     * Re-flowing the book is the most expensive thing this component does: it
     * lays every loaded paragraph out again to find where the pages end. The
     * page box changes shape the instant the stage turns, so left to itself
     * that work would land in the middle of the turn and stutter it.
     *
     * So it waits — for the resizing to stop, and then for the book to have
     * finished turning. Nothing is lost by waiting: the pages keep the flow
     * they already had, which for the second the turn takes is exactly right.
     */
    let pending: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(pending);
      pending = setTimeout(() => {
        const stage = document.getElementById('book-stage');
        const turning = stage?.getAnimations?.().some((a) => a.playState === 'running');
        if (turning) return schedule();
        sync();
      }, 90);
    };

    const ro = new ResizeObserver(schedule);
    ro.observe(page);
    document.fonts?.ready.then(schedule).catch(() => {});

    return () => {
      clearTimeout(pending);
      ro.disconnect();
      ghost.remove();
      ghostRef.current = null;
    };
  }, [pageRef]);

  const measure = useCallback<Measurer>((text) => {
    const ghost = ghostRef.current;
    if (!ghost) return 0;

    ghost.innerHTML = text
      .split(/\n\s*\n/)
      .map(
        (p) =>
          `<p style="margin:0 0 .9em">${displayLines(p)
            .map((line) =>
              line
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;'),
            )
            .join('<br>')}</p>`,
      )
      .join('');

    return ghost.scrollHeight;
  }, []);

  return { measure, ready, box };
}
