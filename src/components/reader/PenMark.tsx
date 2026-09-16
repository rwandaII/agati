'use client';

import { useEffect, useState, type RefObject } from 'react';
import { topOfChar } from './pointing';

/** A fountain pen nib. The pointer a reader leaves in the margin. */
export function Nib({ size = 22 }: { size?: number }) {
  return (
    <svg
      className="pen__nib"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      {/* The body of the nib, tapering to the point that touches the page. */}
      <path
        d="M12 2.6 L16.4 9.2 L12 21.4 L7.6 9.2 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* The slit and the breather hole, which is what makes a nib a nib. */}
      <path
        d="M12 11.6 V20"
        stroke="var(--nib-slit, #f8f3e6)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="12" cy="10" r="1.5" fill="var(--nib-slit, #f8f3e6)" />
    </svg>
  );
}

/**
 * The mark itself, in the margin beside the line a reader stopped at.
 *
 * A mark has to be seen on the way past, so it sits at the line rather than at
 * the top of the page, in the outer margin where it covers no words. Finding
 * that line means measuring the laid-out text, which is the only thing that
 * knows where a character ended up on this screen.
 */
export function PenMark({
  pageRef,
  charsIn,
  label,
  turned = false,
  deps,
}: {
  pageRef: RefObject<HTMLElement | null>;
  /** How much of this page's text lies above the mark. */
  charsIn: number;
  label: string;
  /** Whether the book is rotated, which moves where "down the page" is. */
  turned?: boolean;
  /** Anything that changes where the text sits, so the mark can follow it. */
  deps: unknown;
}) {
  const [top, setTop] = useState<number | null>(null);

  useEffect(() => {
    const page = pageRef.current;
    const body = page?.querySelector('.page__body');
    if (!page || !body) return;

    // measured after the browser has laid the page out, and again if the text
    // moves under it: a reflow, a font arriving, the window resized
    const place = () => setTop(topOfChar(page, body, charsIn, turned));
    place();

    const frame = requestAnimationFrame(place);
    const observer = new ResizeObserver(place);
    observer.observe(body);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pageRef, charsIn, turned, deps]);

  return (
    <span
      className="penmark"
      style={top === null ? undefined : { top: `${Math.max(0, top - 2)}px` }}
      title={`You marked this: ${label}`}
    >
      <Nib size={15} />
      <span className="sr-only">Your mark: {label}</span>
    </span>
  );
}
