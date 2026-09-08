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
      const rect = textBox.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const cs = getComputedStyle(textBox);
      ghost.style.width = `${rect.width}px`;
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

      setBox({ width: rect.width, height: textBox.clientHeight || rect.height });
      setReady(true);
    };

    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(page);
    document.fonts?.ready.then(sync).catch(() => {});

    return () => {
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
