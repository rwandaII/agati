export type Measurer = (text: string) => number;

/** Break one paragraph that cannot fit a page into word-boundary pieces that can. */
export function splitLongParagraph(p: string, maxHeight: number, measure: Measurer): string[] {
  const words = p.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let cur: string[] = [];

  for (const w of words) {
    if (cur.length && measure([...cur, w].join(' ')) > maxHeight) {
      out.push(cur.join(' '));
      cur = [w];
    } else {
      cur.push(w);
    }
  }
  if (cur.length) out.push(cur.join(' '));
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
