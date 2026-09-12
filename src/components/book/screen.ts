'use client';

import { shouldTurn } from './geometry';

/**
 * Giving the book the whole screen, and asking the screen to lie down.
 *
 * Two separate wishes, and they belong to different rooms. Every screen wants
 * the browser out of the way — a book on a desk is not surrounded by tabs and
 * an address bar, and on a television that chrome is the only thing between
 * you and a page. Only a screen held in the hand wants turning.
 *
 * Both are granted to a tap or not at all, which is why this is called from
 * the cover rather than from an effect. And both may be refused — Safari has
 * never shipped the orientation lock, a browser may decline full screen —
 * so nothing here reports success: whether the screen turned is answered
 * afterwards by measuring it, and where it did not, the book turns itself.
 */

type Lockable = ScreenOrientation & { lock?: (to: string) => Promise<void> };
type Fullscreenable = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
type Exitable = Document & { webkitExitFullscreen?: () => Promise<void> | void };

/** Whether a landscape screen is worth asking for on this device. */
function wantsTurning(): boolean {
  if (typeof window === 'undefined') return false;
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  return shouldTurn(window.innerWidth, window.innerHeight, coarse);
}

/**
 * Hand the whole screen to the book.
 *
 * Must be called from the tap that opens it. Every failure here is ordinary —
 * a browser that will not go full screen, a phone that will not turn — and
 * none of them is worth troubling the reader with.
 */
export async function fillTheScreen(): Promise<void> {
  const root = document.documentElement as Fullscreenable;

  try {
    if (!document.fullscreenElement) {
      await (root.requestFullscreen?.({ navigationUI: 'hide' }) ?? root.webkitRequestFullscreen?.());
    }
  } catch {
    // The lock below is worth trying anyway; some browsers grant it alone.
  }

  if (!wantsTurning()) return;

  try {
    await (screen.orientation as Lockable | undefined)?.lock?.('landscape');
  } catch {
    // Safari, and any browser that would rather the reader turned the phone.
  }
}

/** Give the screen back. */
export function releaseTheScreen(): void {
  try {
    screen.orientation?.unlock?.();
  } catch {
    // Nothing was locked, which is the outcome we wanted anyway.
  }
  try {
    const doc = document as Exitable;
    if (document.fullscreenElement) void (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
  } catch {
    // Same.
  }
}

/**
 * Where the book's floating furniture belongs.
 *
 * The pen, the page count and the rest are portalled out of the book, which
 * clips its contents — but not out of the stage, or they would stay upright
 * while the book turned underneath them.
 */
export function stageEl(): HTMLElement {
  return document.getElementById('book-stage') ?? document.body;
}
