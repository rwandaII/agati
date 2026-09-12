/**
 * The stage the book is played on.
 *
 * A book wants a landscape box: two pages side by side is what a book is, and
 * it is the one shape a phone held upright cannot give. So the reader asks the
 * phone to turn, and where the phone will not — Safari has never shipped the
 * orientation lock — it draws the book turned instead.
 *
 * Everything here is arithmetic on a box, deliberately: the decisions are the
 * part worth being sure of, and they are testable without a browser.
 */

/** A box, in whatever coordinates the caller is working in. */
type Box = { width: number; height: number };

/** Anything narrower than this on its short side is a phone. */
export const PHONE_SIDE = 560;

/** Wide enough for a spread whatever its shape — this is desktop, as before. */
const ALWAYS_SPREAD = 780;

/** Below this a page of a spread is too narrow to read. */
const SPREAD_MIN_WIDTH = 600;

/** And a spread needs a box wider than it is tall, not merely a wide one. */
const SPREAD_MIN_RATIO = 1.15;

/**
 * How many pages of the book are open at once.
 *
 * Width alone used to answer this, but a phone turned sideways is 667–930px
 * wide — it straddles any threshold drawn for desktop. So a spread asks for
 * two things: room for two columns of text, and a shape that can hold them.
 * Every box that opens a spread on a desktop today still opens one.
 */
export function leavesFor(width: number, height: number): 1 | 2 {
  if (width >= ALWAYS_SPREAD) return 2;
  if (width >= SPREAD_MIN_WIDTH && width >= height * SPREAD_MIN_RATIO) return 2;
  return 1;
}

/**
 * Whether the book should be drawn turned on its side.
 *
 * The test is simply whether turning would buy the spread. That answers all
 * three screens at once, with no threshold to guess at: a phone held upright
 * gains one, a tablet held upright gains one, and a tablet already wide enough
 * to open both pages either way round gains nothing and is left alone — as is
 * a screen too small to hold two pages whichever way it is held, where turning
 * the words sideways would cost the reader everything and gain nothing.
 *
 * A screen driven by a mouse is never turned, however phone-shaped the window
 * is. That is what the pointer asks: a narrow browser window is not a phone,
 * and rotating somebody's desktop would be an act of vandalism.
 */
export function shouldTurn(width: number, height: number, coarsePointer: boolean): boolean {
  if (!coarsePointer) return false;
  if (height <= width) return false;
  return leavesFor(width, height) === 1 && leavesFor(height, width) === 2;
}

/** The box the book is actually played on, which is the screen, or the screen turned. */
export function stageOf(width: number, height: number, turned: boolean): Box {
  return turned ? { width: height, height: width } : { width, height };
}

/** Whether the book is being read at phone size, and so wants phone-sized detail. */
export function isPhoneStage({ width, height }: Box): boolean {
  return Math.min(width, height) <= PHONE_SIDE;
}

/**
 * A movement in screen axes, read in the book's own.
 *
 * The book is drawn a quarter-turn clockwise, so its own right-hand side runs
 * down the glass and its own downward runs to the left. A finger swiping up
 * the phone is therefore swiping forward through the book.
 */
export function inFrame(dx: number, dy: number, turned: boolean): { dx: number; dy: number } {
  return turned ? { dx: dy, dy: -dx } : { dx, dy };
}

/** The two edges of a rectangle this module needs; `DOMRect` satisfies it. */
type Edges = { top: number; right: number };

/**
 * How far down a page something sits, measured in the page's own axes.
 *
 * `getBoundingClientRect` answers in screen coordinates, and under a turned
 * book those are not the page's coordinates: down the page is leftward across
 * the glass, so the distance is taken from the page's right edge instead.
 */
export function downFrom(page: Edges, rect: Edges, turned: boolean): number {
  return turned ? page.right - rect.right : rect.top - page.top;
}
