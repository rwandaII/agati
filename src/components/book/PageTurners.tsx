'use client';

/**
 * The visible way to move between pages.
 *
 * Scrolling belongs to the page content, so turning has to be something you can
 * see and reach for — and it says where it goes, so you are never guessing.
 */
export function PageTurners({
  onPrev,
  onNext,
  canPrev,
  canNext,
  prevLabel,
  nextLabel,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  prevLabel?: string;
  nextLabel?: string;
}) {
  return (
    <>
      <button
        type="button"
        className="turner turner--prev"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label={prevLabel ? `Back to ${prevLabel}` : 'Previous page'}
      >
        <span className="turner__arrow" aria-hidden="true">
          ‹
        </span>
        {prevLabel ? <span className="turner__label">{prevLabel}</span> : null}
      </button>

      <button
        type="button"
        className="turner turner--next"
        onClick={onNext}
        disabled={!canNext}
        aria-label={nextLabel ? `On to ${nextLabel}` : 'Next page'}
      >
        <span className="turner__arrow" aria-hidden="true">
          ›
        </span>
        {nextLabel ? <span className="turner__label">{nextLabel}</span> : null}
      </button>
    </>
  );
}
