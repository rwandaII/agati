export type Measurer = (text: string) => number;

/**
 * Break one paragraph that cannot fit a page into word-boundary pieces that can.
 *
 * Each piece is the most words that will fit, which is the same answer walking
 * the paragraph a word at a time would give — but found by searching for the
 * break rather than walking to it. Measuring is a forced layout of the growing
 * text, so one call per word is a second of frozen page for a long chapter, and
 * a phone's page is short enough that most chapters have one.
 *
 * The search is sound because height never falls as words are added: if some
 * number of words is too tall, so is every larger number. It starts from the
 * size of the previous piece, since the pieces of a paragraph come out much of
 * a size, and the answer is usually a step or two away.
 */
export function splitLongParagraph(p: string, maxHeight: number, measure: Measurer): string[] {
  const words = p.split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const out: string[] = [];
  let at = 0;
  let hint = 1;

  while (at < words.length) {
    const left = words.length - at;
    const fits = (n: number) => measure(words.slice(at, at + n).join(' ')) <= maxHeight;

    // `lo` words are known to fit; `hi` words are known not to.
    let lo = 0;
    let hi = left + 1;

    const start = Math.min(Math.max(hint, 1), left);
    if (fits(start)) {
      lo = start;
      for (let step = 1; lo < left; step *= 2) {
        const probe = Math.min(lo + step, left);
        if (fits(probe)) lo = probe;
        else {
          hi = probe;
          break;
        }
      }
    } else {
      hi = start;
      for (let step = 1; hi > 1; step *= 2) {
        const probe = Math.max(hi - step, 1);
        if (fits(probe)) {
          lo = probe;
          break;
        }
        hi = probe;
      }
    }

    while (hi - lo > 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (fits(mid)) lo = mid;
      else hi = mid;
    }

    // A single word too tall for a page still has to go somewhere.
    const take = Math.max(lo, 1);
    out.push(words.slice(at, at + take).join(' '));
    at += take;
    hint = take;
  }

  return out;
}

/**
 * Pack paragraphs into pages that each fit within maxHeight.
 *
 * Measurement is injected rather than read from the DOM: jsdom has no layout
 * engine, and the reader needs to repaginate against the real page box when the
 * window is resized. Never drops or duplicates content.
 */
export function fitParagraphs(
  paragraphs: string[],
  maxHeight: number,
  measure: Measurer,
): string[][] {
  // 1. Reduce every unit to something that can fit on a page by itself.
  const units: string[] = [];
  for (const p of paragraphs) {
    if (!p.trim()) continue;
    if (measure(p) <= maxHeight) units.push(p);
    else units.push(...splitLongParagraph(p, maxHeight, measure));
  }

  // 2. Greedily fill pages.
  const pages: string[][] = [];
  let cur: string[] = [];

  for (const u of units) {
    if (!cur.length) {
      cur = [u];
      continue;
    }
    if (measure([...cur, u].join('\n\n')) <= maxHeight) cur.push(u);
    else {
      pages.push(cur);
      cur = [u];
    }
  }
  if (cur.length) pages.push(cur);

  return pages;
}
