import { describe, expect, it } from 'vitest';
import { anchorOfPage, pageAtAnchor, weigh } from './anchor';

/** The same book, set twice at different sizes. */
const BOOK = [
  'Down, down, down. Would the fall never come to an end?',
  'There was nothing else to do, so Alice soon began talking again.',
  'Dinah my dear, I wish you were down here with me!',
  'Presently she began again.',
];

const wide = [BOOK.slice(0, 2).join('\n\n'), BOOK.slice(2).join('\n\n')];
const narrow = [BOOK[0], BOOK[1], BOOK[2], BOOK[3]];

describe('weigh', () => {
  it('counts only the characters that carry the text', () => {
    expect(weigh('a b')).toBe(2);
    expect(weigh('a\n\nb')).toBe(2);
    expect(weigh('   ')).toBe(0);
  });
});

describe('anchorOfPage', () => {
  it('is nothing at the first page', () => {
    expect(anchorOfPage(wide, 0)).toBe(0);
  });

  it('counts the text that came before', () => {
    expect(anchorOfPage(narrow, 1)).toBe(weigh(BOOK[0]));
    expect(anchorOfPage(narrow, 2)).toBe(weigh(BOOK[0]) + weigh(BOOK[1]));
  });
});

describe('pageAtAnchor', () => {
  it('finds the page the anchor falls on', () => {
    expect(pageAtAnchor(narrow, 0)).toBe(0);
    expect(pageAtAnchor(narrow, weigh(BOOK[0]))).toBe(1);
    expect(pageAtAnchor(narrow, weigh(BOOK[0]) + weigh(BOOK[1]))).toBe(2);
  });

  it('lands mid-page on the page that holds the text', () => {
    expect(pageAtAnchor(narrow, weigh(BOOK[0]) + 5)).toBe(1);
  });

  /**
   * The point of the whole thing: a place saved on one screen has to survive
   * being reopened on another, where the text breaks into different pages.
   */
  it('survives a re-flow into different pages', () => {
    const saved = anchorOfPage(wide, 1); // start of the third paragraph
    expect(pageAtAnchor(narrow, saved)).toBe(2);

    const savedNarrow = anchorOfPage(narrow, 1); // start of the second
    expect(pageAtAnchor(wide, savedNarrow)).toBe(0); // still on the wide first page
  });

  it('clamps past the end rather than running off the book', () => {
    expect(pageAtAnchor(narrow, 10_000)).toBe(narrow.length - 1);
  });

  it('clamps before the beginning', () => {
    expect(pageAtAnchor(narrow, -50)).toBe(0);
  });

  it('has nowhere to go in an empty book', () => {
    expect(pageAtAnchor([], 40)).toBe(0);
    expect(anchorOfPage([], 3)).toBe(0);
  });
});
