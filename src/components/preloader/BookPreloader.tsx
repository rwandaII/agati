'use client';

import { useEffect, useState } from 'react';
import './preloader.css';

const MIN_VISIBLE_MS = 900; // never let it flash
const EXIT_MS = 700; // must match .preloader--closing in preloader.css

/**
 * A small book that opens and thumbs its own pages while the site loads,
 * then closes and lifts away. Removes itself from the DOM entirely.
 */
export function BookPreloader() {
  const [phase, setPhase] = useState<'loading' | 'closing' | 'gone'>('loading');

  useEffect(() => {
    const shownAt = Date.now();
    let timer: ReturnType<typeof setTimeout>;

    const finish = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt));
      timer = setTimeout(() => {
        setPhase('closing');
        timer = setTimeout(() => setPhase('gone'), EXIT_MS);
      }, wait);
    };

    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', finish);
    };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      className={`preloader ${phase === 'closing' ? 'preloader--closing' : ''}`}
      aria-hidden="true"
    >
      <div className="preloader__stage">
        <div className="preloader__book">
          <span className="preloader__cover preloader__cover--back" />
          <span className="preloader__leaf preloader__leaf--1" />
          <span className="preloader__leaf preloader__leaf--2" />
          <span className="preloader__leaf preloader__leaf--3" />
          <span className="preloader__cover preloader__cover--front" />
        </div>

        <p className="preloader__word">Agati Library</p>

        <div className="preloader__bar">
          <span className="preloader__fill" />
        </div>
      </div>
    </div>
  );
}
