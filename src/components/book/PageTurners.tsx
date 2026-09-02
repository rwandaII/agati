'use client';

/**
 * The visible way to turn a page.
 *
 * Scrolling belongs to the page content, so turning has to be something the
 * reader can see and reach for.
 */
export function PageTurners({
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <>
      <button
        type="button"
        className="turner turner--prev"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Previous page"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <button
        type="button"
        className="turner turner--next"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Next page"
      >
        <span aria-hidden="true">›</span>
      </button>
    </>
  );
}
