/** Must stay in sync with --turn-ms in theme.css. */
export const TURN_MS = 700;

/** Wheel delta that must accumulate before a page turns. */
export const WHEEL_THRESHOLD = 110;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function turnDuration(): number {
  return prefersReducedMotion() ? 1 : TURN_MS;
}
