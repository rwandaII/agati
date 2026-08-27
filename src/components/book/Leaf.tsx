'use client';

import type { ReactNode } from 'react';

/**
 * One turning leaf.
 *
 * `front` and `back` each receive a COMPLETE spread. The faces clip to the half
 * that should be visible, so callers never have to split content by hand:
 *
 *   forward  — front shows the outgoing RIGHT page, back shows the incoming LEFT page
 *   backward — front shows the outgoing LEFT page,  back shows the incoming RIGHT page
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
