'use client';

import { useState } from 'react';
import { turnDuration } from './constants';
import { fillTheScreen } from './screen';
import { SITE } from '@/config/brand';
import { MARK_COLOUR } from '@/config/photos';

/** The closed hardcover. Swings open on its spine and hands over to the book. */
export function Cover({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);

  const open = () => {
    if (opening) return;
    // The website is a book too, and a book wants to be lying down. Asked for
    // here because this is the tap: full screen and the orientation lock are
    // granted to a gesture or not at all.
    void fillTheScreen();
    setOpening(true);
    setTimeout(onOpen, turnDuration() + 220);
  };

  return (
    <div className={`cover ${opening ? 'cover--opening' : ''}`}>
      <button type="button" className="cover__face" onClick={open} aria-label="Open the book">
        <span className="cover__bands" aria-hidden="true" />
        <span className="cover__rule" aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="cover__mark" src={MARK_COLOUR} alt="Agati Library" />
        <span className="cover__wordmark">AGATI LIBRARY</span>
        <span className="cover__tagline">{SITE.tagline}</span>
        <span className="cover__hint">Click to open the book</span>
      </button>
    </div>
  );
}
