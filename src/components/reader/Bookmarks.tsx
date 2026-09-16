'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { stageEl } from '@/components/book/screen';
import { Nib } from './PenMark';

export type Mark = { id: string; anchor: number; label: string };

/**
 * The pen, and the marks it has left.
 *
 * Picking the pen up doesn't mark anything. It puts the pen in your hand, and
 * the next place you touch on the page is where the mark goes, which means a
 * reader marks the line they stopped at rather than the page they're on.
 *
 * Portalled out for the same reason everything else here is: the book clips its
 * contents, so a control rendered inside it would be cut off. Out as far as the
 * frame and no further, since the frame is what rotates on a phone.
 */
export function Bookmarks({
  marks,
  penMode,
  onTogglePen,
  onGo,
  onRemove,
  disabled,
  hint,
}: {
  marks: Mark[];
  penMode: boolean;
  onTogglePen: () => void;
  onGo: (anchor: number) => void;
  onRemove: (id: string) => void;
  disabled: boolean;
  hint: string | null;
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  // neither the pen nor a list of places is worth trapping anybody in
  useEffect(() => {
    if (!open && !penMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (penMode) onTogglePen();
      setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, penMode, onTogglePen]);

  if (!mounted) return null;

  return createPortal(
    <div className="pen">
      {open ? (
        <div className="pen__list" role="dialog" aria-label="Your marks">
          <p className="pen__listHead">
            {marks.length
              ? `${marks.length} mark${marks.length > 1 ? 's' : ''} in this book`
              : 'No marks yet'}
          </p>

          {marks.length ? (
            <ul>
              {marks.map((m) => (
                <li key={m.id}>
                  <button type="button" className="pen__go" onClick={() => onGo(m.anchor)}>
                    <Nib size={13} />
                    <span className="pen__label">{m.label}</span>
                  </button>
                  <button
                    type="button"
                    className="pen__drop"
                    onClick={() => onRemove(m.id)}
                    aria-label={`Remove the mark at ${m.label}`}
                    title="Remove this mark"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="pen__empty">
              Take up the pen, then touch the line you want to come back to.
            </p>
          )}
        </div>
      ) : null}

      <div className="pen__bar">
        <button
          type="button"
          className={`pen__button ${penMode ? 'pen__button--held' : ''}`}
          onClick={onTogglePen}
          disabled={disabled}
          aria-pressed={penMode}
          aria-label={penMode ? 'Put the pen down' : 'Take up the pen to mark a line'}
          title={penMode ? 'Put the pen down' : 'Mark a line'}
        >
          <Nib />
        </button>

        <button
          type="button"
          className="pen__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Hide your marks' : 'Show your marks'}
        >
          My marks
          {marks.length ? <span className="pen__count">{marks.length}</span> : null}
        </button>
      </div>

      {penMode ? (
        <p className="pen__hint pen__hint--holding" role="status">
          Touch the line you want to mark
        </p>
      ) : hint ? (
        <p className="pen__hint" role="status">
          {hint}
        </p>
      ) : null}
    </div>,
    stageEl(),
  );
}
