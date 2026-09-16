import { describe, it, expect } from 'vitest';
import { fitParagraphs, splitLongParagraph } from './paginate';

/** Pretend every 40 characters occupies one 20px line. */
const measure = (text: string) => Math.ceil(text.length / 40) * 20;

describe('fitParagraphs', () => {
  it('loses no words', () => {
    const paras = Array.from({ length: 30 }, (_, i) => `Paragraph ${i} with a little text in it.`);
    const flat = fitParagraphs(paras, 200, measure).flat().join(' ');
    for (const p of paras) expect(flat).toContain(p);
  });

  it('duplicates no paragraph', () => {
    const paras = Array.from({ length: 30 }, (_, i) => `Unique marker ${i}.`);
    const flat = fitParagraphs(paras, 200, measure).flat();
    expect(new Set(flat).size).toBe(flat.length);
  });

  it('never overfills a page', () => {
    const paras = Array.from({ length: 40 }, () => 'x'.repeat(60));
    for (const page of fitParagraphs(paras, 200, measure)) {
      expect(measure(page.join('\n\n'))).toBeLessThanOrEqual(200);
    }
  });

  it('splits a paragraph that is taller than a whole page', () => {
    const giant = Array.from({ length: 200 }, (_, i) => `w${i}`).join(' ');
    const pages = fitParagraphs([giant], 200, measure);
    expect(pages.length).toBeGreaterThan(1);
    for (const page of pages) expect(measure(page.join('\n\n'))).toBeLessThanOrEqual(200);
    expect(pages.flat().join(' ').split(/\s+/)).toHaveLength(200);
  });

  it('returns no pages for no text', () => {
    expect(fitParagraphs([], 200, measure)).toEqual([]);
    expect(fitParagraphs(['', '   '], 200, measure)).toEqual([]);
  });

  it('keeps a single short paragraph on one page', () => {
    expect(fitParagraphs(['Short.'], 200, measure)).toEqual([['Short.']]);
  });

  it('preserves paragraph order', () => {
    const paras = Array.from({ length: 25 }, (_, i) => `P${i}.`);
    expect(fitParagraphs(paras, 100, measure).flat()).toEqual(paras);
  });
});

describe('splitLongParagraph', () => {
  it('breaks on word boundaries and keeps every word', () => {
    const words = Array.from({ length: 120 }, (_, i) => `w${i}`);
    const parts = splitLongParagraph(words.join(' '), 100, measure);
    expect(parts.join(' ').split(/\s+/)).toEqual(words);
    for (const part of parts) expect(part).not.toMatch(/^\s|\s$/);
  });

  it('fills each piece as full as it will go', () => {
    // the property the search has to preserve: every piece but the last is the
    // most words that fit, so one more word would have overflowed
    const words = Array.from({ length: 300 }, (_, i) => `word${i}`);
    const parts = splitLongParagraph(words.join(' '), 200, measure);

    for (let i = 0; i < parts.length - 1; i++) {
      const firstOfNext = parts[i + 1].split(' ')[0];
      expect(measure(parts[i])).toBeLessThanOrEqual(200);
      expect(measure(`${parts[i]} ${firstOfNext}`)).toBeGreaterThan(200);
    }
  });

  it('does not ask the browser to lay the paragraph out once per word', () => {
    // measuring forces a layout of the growing text, so one call per word is a
    // second of frozen page on a long chapter. Search for the breaks instead.
    const words = Array.from({ length: 2000 }, (_, i) => `word${i}`);
    let calls = 0;
    const counted = (text: string) => {
      calls++;
      return measure(text);
    };

    splitLongParagraph(words.join(' '), 200, counted);

    expect(calls).toBeLessThan(words.length / 4);
  });

  it('never splits inside a word', () => {
    const parts = splitLongParagraph('alpha beta gamma delta epsilon', 20, measure);
    for (const part of parts) {
      for (const w of part.split(' ')) {
        expect(['alpha', 'beta', 'gamma', 'delta', 'epsilon']).toContain(w);
      }
    }
  });
});
