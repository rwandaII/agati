'use client';

import { shouldTurn } from './geometry';

/**
 * Fullscreen, and asking the screen to lie down.
 *
 * Two separate wishes. Every screen wants the browser chrome out of the way,
 * only a screen held in the hand wants rotating.
 *
 * Both are granted to a tap or not at all, which is why this is called from
 * the cover and not from an effect, and both can be refused (Safari has never
 * shipped the orientation lock). So nothing here reports success. Whether the
 * screen actually turned gets answered afterwards by measuring it, and where
 * it didn't, the book turns itself.
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
 * Hand the whole screen to the book. Must be called from the tap that opens
 * it. Every failure here is ordinary and none of them is worth bothering the
 * reader with.
 */
export async function fillTheScreen(): Promise<void> {
  const root = document.documentElement as Fullscreenable;

  try {
    if (!document.fullscreenElement) {
      await (root.requestFullscreen?.({ navigationUI: 'hide' }) ?? root.webkitRequestFullscreen?.());
    }
  } catch {
    // the lock below is worth trying anyway, some browsers grant it alone
  }

  if (!wantsTurning()) return;

  try {
    await (screen.orientation as Lockable | undefined)?.lock?.('landscape');
  } catch {
    // safari, and anything else that would rather the reader turned the phone
  }
}

/** Give the screen back. */
export function releaseTheScreen(): void {
  try {
    screen.orientation?.unlock?.();
  } catch {
    // nothing was locked, which is the outcome we wanted anyway
  }
  try {
    const doc = document as Exitable;
    if (document.fullscreenElement) void (doc.exitFullscreen?.() ?? doc.webkitExitFullscreen?.());
  } catch {
    // same
  }
}

/**
 * Where the book's floating controls go. Out of the book, which clips its
 * contents, but not out of the stage, or they'd stay upright while the book
 * rotated underneath them.
 */
export function stageEl(): HTMLElement {
  return document.getElementById('book-stage') ?? document.body;
}
