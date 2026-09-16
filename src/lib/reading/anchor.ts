/**
 * Keeping a place in a book that is set afresh every time it's opened.
 *
 * The reader reflows a book's text into whatever pages fit the screen in front
 * of it, so "page 30" means one thing on a laptop and something else on a
 * phone. Saving a page number would hand a reader back to the wrong paragraph
 * as soon as they picked up a different device.
 *
 * So a place is recorded as an amount of book rather than a page: how much text
 * lies behind you, whitespace not counted, since whitespace is exactly what
 * changes when the same text is broken into different pages. The number means
 * the same thing on every screen and the page is worked out fresh each time.
 *
 * Comics don't reflow, a plate is a page. They anchor on the plate number and
 * never come through here.
 */

/** How much text a string carries, ignoring how it happens to be laid out. */
export function weigh(text: string): number {
  let n = 0;
  for (const ch of text) if (!/\s/.test(ch)) n++;
  return n;
}

/** The place at which a page begins: everything before it, weighed. */
export function anchorOfPage(pages: string[], index: number): number {
  let total = 0;
  for (let i = 0; i < index && i < pages.length; i++) total += weigh(pages[i]);
  return total;
}

/** The page holding a saved place, in whatever pages the book has now. */
export function pageAtAnchor(pages: string[], anchor: number): number {
  if (!pages.length || anchor <= 0) return 0;

  let seen = 0;
  for (let i = 0; i < pages.length; i++) {
    seen += weigh(pages[i]);
    if (anchor < seen) return i;
  }

  // saved beyond what this edition holds, so the end is the closest we can get
  return pages.length - 1;
}
