'use client';

import type { ReactNode } from 'react';

/**
 * One turning leaf.
 *
 * `front` and `back` each take a COMPLETE spread and clip to the half that
 * should be visible, so callers never split content by hand:
 *
 *   forward:  front = outgoing right page, back = incoming left page
 *   backward: front = outgoing left page,  back = incoming right page
 */
export function Leaf({
  dir,
  front,
  back,
}: {
  dir: 1 | -1;
  front: ReactNode;
  back: ReactNode;
}) {
  return (
    <div className={`leaf ${dir === 1 ? 'leaf--fwd' : 'leaf--back'}`} aria-hidden="true">
      <div className="leaf__face leaf__face--front">
        <div className="leaf__inner">{front}</div>
        <span className="leaf__shade" />
      </div>

      <div className="leaf__face leaf__face--back">
        <div className="leaf__inner">{back}</div>
        <span className="leaf__shade" />
      </div>

      <span className="leaf__sheen" />
    </div>
  );
}
