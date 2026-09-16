'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { turnDuration } from '@/components/book/constants';
import { fillTheScreen } from '@/components/book/screen';

/**
 * Every book gets its own closed cover before you read it.
 *
 * It carries the book's title, author and colour and swings open into the
 * full-screen reader, the same movement the library's own cover makes, so
 * opening any book is the same gesture.
 *
 * It reuses the `.cover` class deliberately: the `.book:has(.cover)` rule keeps
 * the whole book at closed size until this starts opening, which is what makes
 * it expand into the browser as the cover swings.
 */
export function BookCover({
  title,
  author,
  coverColor,
  coverImage,
  category,
  badge,
  onOpen,
}: {
  title: string;
  author: string;
  coverColor: string;
  coverImage?: string | null;
  category: string;
  badge?: string;
  onOpen: () => void;
}) {
  const [opening, setOpening] = useState(false);

  // the page-turn buttons live on the body, outside this tree. Flag the cover
  // while it's up so they stay hidden until the book is actually open.
  useEffect(() => {
    document.body.classList.add('is-covered');
    return () => document.body.classList.remove('is-covered');
  }, []);

  const open = () => {
    if (opening) return;
    // fullscreen and the orientation lock are granted to a gesture or not at
    // all, so ask here. A phone that won't rotate gets the book rotated for it.
    void fillTheScreen();
    setOpening(true);
    setTimeout(onOpen, turnDuration() + 220);
  };

  return (
    <div
      className={`cover cover--book ${opening ? 'cover--opening' : ''}`}
      style={{ '--cover': coverColor } as CSSProperties}
    >
      <button type="button" className="cover__face" onClick={open} aria-label={`Open ${title}`}>
        <span className="cover__bands" aria-hidden="true" />
        <span className="cover__rule" aria-hidden="true" />

        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="cover__art" src={coverImage} alt="" aria-hidden="true" />
        ) : null}

        <span className="cover__kicker">{category}</span>
        <span className="cover__title">{title}</span>
        <span className="cover__author">{author}</span>

        {badge ? <span className="cover__badge">{badge}</span> : null}

        <span className="cover__hint">Click to open the book</span>
      </button>
    </div>
  );
}
