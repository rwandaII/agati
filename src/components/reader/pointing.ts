'use client';

import { weigh } from '@/lib/reading/anchor';
import { downFrom } from '@/components/book/geometry';

/**
 * A place on the screen into a place in the book, and back again.
 *
 * A reader pointing the pen at a line means that line, not that page. So a
 * click has to resolve down to the character it landed on, and a mark has to
 * find its way back to the same character when the book is opened again on a
 * screen that lays the text out differently.
 */

/** The caret nearest a point, across the two APIs browsers offer for it. */
function caretAt(x: number, y: number): Range | null {
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
  };

  if (typeof document.caretRangeFromPoint === 'function') {
    return document.caretRangeFromPoint(x, y);
  }

  const pos = doc.caretPositionFromPoint?.(x, y);
  if (!pos) return null;

  const range = document.createRange();
  range.setStart(pos.offsetNode, pos.offset);
  return range;
}

/**
 * How much of a page's text lies above and to the left of a point. Same measure
 * lib/reading/anchor uses, so the two agree.
 */
export function charsBefore(body: Element, x: number, y: number): number {
  const caret = caretAt(x, y);
  if (!caret || !body.contains(caret.startContainer)) return 0;

  const upTo = document.createRange();
  upTo.setStart(body, 0);
  try {
    upTo.setEnd(caret.startContainer, caret.startOffset);
  } catch {
    return 0;
  }

  return weigh(upTo.toString());
}

/**
 * The words a mark should be known by: the line the reader pointed at.
 *
 * Taken from the paragraph under the nib rather than the exact character, and
 * snapped back to the start of a word. A label beginning mid-word reads as
 * damage, and a mark is meant to be recognised at a glance.
 */
export function wordsAt(body: Element, x: number, y: number): string {
  const caret = caretAt(x, y);
  const node = caret && body.contains(caret.startContainer) ? caret.startContainer : null;

  const from =
    node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as Element | null);
  const block =
    from?.closest('p, li, h1, h2, h3, blockquote') ?? body.querySelector('p') ?? body;

  const text = (block.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return '';

  // where in that paragraph the nib landed
  let at = 0;
  if (node?.nodeType === Node.TEXT_NODE && caret) {
    const upTo = document.createRange();
    upTo.setStart(block, 0);
    try {
      upTo.setEnd(node, caret.startOffset);
      at = upTo.toString().replace(/\s+/g, ' ').trimStart().length;
    } catch {
      at = 0;
    }
  }

  // don't end so close to the paragraph's end that the label is a fragment, and
  // don't start in the middle of a word
  at = Math.max(0, Math.min(at, Math.max(0, text.length - 24)));
  while (at > 0 && !/\s/.test(text[at - 1])) at--;

  const rest = text.slice(at);
  const label = rest.slice(0, 72).trim();
  return label.length < rest.length ? `${label}…` : label;
}

/**
 * Where on the page a given amount of text falls, so a mark can be drawn beside
 * its line rather than at the top of the page. Null when the text runs out
 * before that point, which happens while the page is still being laid out.
 *
 * The browser answers in screen coordinates, and on a rotated book those aren't
 * the page's, so `turned` says to measure along the page's own downward.
 */
export function topOfChar(
  page: Element,
  body: Element,
  chars: number,
  turned = false,
): number | null {
  if (chars <= 0) return 0;

  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  let seen = 0;

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? '';
    const heft = weigh(text);

    if (seen + heft < chars) {
      seen += heft;
      continue;
    }

    // the character we want is inside this node, walk it to find which one
    let offset = 0;
    for (; offset < text.length && seen < chars; offset++) {
      if (!/\s/.test(text[offset])) seen++;
    }

    const range = document.createRange();
    range.setStart(node, Math.min(offset, text.length));
    range.setEnd(node, Math.min(offset + 1, text.length));

    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) return null;

    return downFrom(page.getBoundingClientRect(), rect, turned);
  }

  return null;
}
