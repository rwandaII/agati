'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { stageEl } from '@/components/book/screen';

/**
 * A scanned comic plate.
 *
 * Fitted to the page rather than cropped, so no panel is ever cut off — but a
 * whole newspaper page shrunk to half a screen makes the lettering too small to
 * read, which defeats the point. Tapping a plate opens it full size, where the
 * speech balloons are legible and you can move around the page.
 */
export function ComicPage({
  src,
  folio,
  alt,
}: {
  src: string | null;
  folio: number | null;
  alt: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Escape closes, and the page behind must not scroll away underneath.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!src) {
    return (
      <>
        <div className="page__body page__body--comic" />
        <footer className="page__folio">&nbsp;</footer>
      </>
    );
  }

  return (
    <>
      <div className="page__body page__body--comic">
        <button
          type="button"
          className="comic__frame"
          onClick={() => setOpen(true)}
          aria-label={`${alt} — open larger`}
        >
          <Image
            className="comic__plate"
            src={src}
            alt={alt}
            fill
            quality={92}
            draggable={false}
            sizes="(max-width: 780px) 92vw, 46vw"
          />
          <span className="comic__zoomHint" aria-hidden="true">
            Tap to enlarge
          </span>
        </button>
      </div>

      <footer className="page__folio">{folio}</footer>

      {/*
        The book block carries `contain: layout paint`, which makes it a
        containing block for fixed positioning — an overlay rendered in place
        would be trapped inside the book. A portal lifts it out to the frame,
        where full screen genuinely means full screen — and no further, or it
        would stay upright while a turned book lay on its side beneath it.
      */}
      {open && mounted
        ? createPortal(
            <div
              className="lightbox"
              role="dialog"
              aria-modal="true"
              aria-label={alt}
              onClick={() => setOpen(false)}
            >
              <button type="button" className="lightbox__close" aria-label="Close">
                ✕
              </button>

              <div className="lightbox__scroll" onClick={(e) => e.stopPropagation()}>
                <Image
                  className="lightbox__plate"
                  src={src}
                  alt={alt}
                  width={2000}
                  height={2730}
                  quality={95}
                  draggable={false}
                  sizes="(max-width: 900px) 180vw, 130vw"
                />
              </div>
            </div>,
            stageEl(),
          )
        : null}
    </>
  );
}
