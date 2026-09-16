/**
 * Stage arithmetic for the book.
 *
 * A book wants a landscape box, two pages side by side, and that is the one
 * shape a phone held upright can't give. So we ask the phone to rotate, and
 * where it won't (Safari has never shipped the orientation lock) we draw the
 * book rotated instead.
 *
 * All of it is arithmetic on a box, so it can be tested without a browser.
 */

/** A box, in whatever coordinates the caller is working in. */
type Box = { width: number; height: number };

/** Narrower than this on the short side and it's a phone. */
export const PHONE_SIDE = 560;

/** Wide enough for a spread whatever the shape. This is desktop, as before. */
const ALWAYS_SPREAD = 780;

/** Below this, a page of a spread is too narrow to read. */
const SPREAD_MIN_WIDTH = 600;

/** A spread also needs a box wider than it is tall, not just a wide one. */
const SPREAD_MIN_RATIO = 1.15;

/**
 * How many pages are open at once.
 *
 * Width alone used to answer this, but a phone on its side is 667-930px wide
 * and straddles any threshold drawn for desktop. So a spread asks for two
 * things: room for two columns of text, and a shape that can hold them.
 */
export function leavesFor(width: number, height: number): 1 | 2 {
  if (width >= ALWAYS_SPREAD) return 2;
  if (width >= SPREAD_MIN_WIDTH && width >= height * SPREAD_MIN_RATIO) return 2;
  return 1;
}

/**
 * Whether the book should be drawn on its side.
 *
 * The test is just whether rotating would buy us the spread, which answers
 * every screen at once with no threshold to guess at. A tablet already wide
 * enough either way gains nothing, and so does a screen too small for two
 * pages whichever way it's held.
 *
 * A mouse-driven screen is never rotated, however phone-shaped the window is.
 * A narrow browser window is not a phone.
 */
export function shouldTurn(width: number, height: number, coarsePointer: boolean): boolean {
  if (!coarsePointer) return false;
  if (height <= width) return false;
  return leavesFor(width, height) === 1 && leavesFor(height, width) === 2;
}

/** The box the book is played on: the screen, or the screen rotated. */
export function stageOf(width: number, height: number, turned: boolean): Box {
  return turned ? { width: height, height: width } : { width, height };
}

/** Whether the book is being read at phone size, and wants phone-sized detail. */
export function isPhoneStage({ width, height }: Box): boolean {
  return Math.min(width, height) <= PHONE_SIDE;
}

/**
 * A movement in screen axes, read in the book's own.
 *
 * The book is a quarter turn clockwise, so its right-hand side runs down the
 * glass and its down runs to the left. A finger swiping up the phone is
 * swiping forward through the book.
 */
export function inFrame(dx: number, dy: number, turned: boolean): { dx: number; dy: number } {
  return turned ? { dx: dy, dy: -dx } : { dx, dy };
}

/** The two edges of a rectangle this module needs. DOMRect satisfies it. */
type Edges = { top: number; right: number };

/**
 * How far down a page something sits, in the page's own axes.
 *
 * getBoundingClientRect answers in screen coordinates, which aren't the page's
 * when the book is rotated: down the page is leftward across the glass, so
 * measure from the page's right edge instead.
 */
export function downFrom(page: Edges, rect: Edges, turned: boolean): number {
  return turned ? page.right - rect.right : rect.top - page.top;
}
