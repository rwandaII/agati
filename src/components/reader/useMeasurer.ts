'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { displayLines } from './lines';
import type { Measurer } from '@/lib/reader/paginate';

/**
 * Builds a Measurer from a hidden clone of the real page box, so pagination
 * uses the exact font, width and line height the reader gets, and repaginates
 * when the window is resized or the webfont lands.
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
    // a page opens with a drop capital, two or three lines tall, which pushes
    // the text around it. Measuring without one fits a line more than the page
    // can hold, and that line gets clipped at the foot.
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

      // measured in the page's own axes, not the screen's. On a phone the book
      // is rotated, and a bounding rect would report the column's height as its
      // width and paginate the book into ribbons.
      //
      // and measured to the text's width, not the column's. The ghost has no
      // padding, so a padded width fits slightly more on every line than the
      // page can, which is one line too many at the foot.
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
     * Reflowing is the most expensive thing this component does: every loaded
     * paragraph gets laid out again to find where the pages end. The page box
     * changes shape the instant the stage rotates, so left alone that work
     * lands in the middle of the turn and stutters it.
     *
     * So wait for the resizing to stop, then for the turn to finish. Nothing is
     * lost by waiting, the pages keep the flow they already had.
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
