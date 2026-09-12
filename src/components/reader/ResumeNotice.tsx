'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { stageEl } from '@/components/book/screen';

/** How long the notice stays before it gets out of the way. */
const SHOWN_FOR = 9000;

/**
 * Told, not asked.
 *
 * A book reopens where it was left, without a dialogue in the way — but a
 * reader who did not expect that needs to see what happened and be able to
 * undo it, so this says where they landed and offers the first page back.
 *
 * The place is found while the cover is still closed, a second after the page
 * loads. Announcing it then would spend the whole notice behind the cover and
 * leave nothing to see on opening it, so this waits for the book to be open —
 * which is exactly what the `is-covered` flag on the body means.
 */
export function ResumeNotice({
  page,
  onStartOver,
  onDismiss,
}: {
  page: number;
  onStartOver: () => void;
  onDismiss: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const covered = () => document.body.classList.contains('is-covered');
    if (!covered()) {
      setOpen(true);
      return;
    }

    const watch = new MutationObserver(() => {
      if (!covered()) {
        setOpen(true);
        watch.disconnect();
      }
    });
    watch.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => watch.disconnect();
  }, []);

  // It has said its piece by the time anyone has read a paragraph.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onDismiss, SHOWN_FOR);
    return () => clearTimeout(t);
  }, [open, onDismiss]);

  if (!open) return null;

  return createPortal(
    <div className="resume" role="status">
      <p className="resume__text">
        Picked up where you left off — page <strong>{page}</strong>
      </p>
      <button type="button" className="resume__action" onClick={onStartOver}>
        Start from the beginning
      </button>
      <button type="button" className="resume__close" onClick={onDismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>,
    stageEl(),
  );
}
