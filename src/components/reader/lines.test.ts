import { describe, expect, it } from 'vitest';
import { displayLines } from './lines';

describe('displayLines', () => {
  it('joins a paragraph that a machine wrapped', () => {
    // Straight out of Gutenberg's Alice: hard-wrapped at about seventy.
    const para = [
      'In another moment down went Alice after it, never once considering how',
      'in the world she was to get out again.',
    ].join('\n');

    expect(displayLines(para)).toEqual([
      'In another moment down went Alice after it, never once considering how in the world she was to get out again.',
    ]);
  });

  it("keeps the breaks a poet wrote", () => {
    const verse = ['Maître Corbeau, sur un arbre perché,', 'Tenait en son bec un fromage.'].join('\n');

    expect(displayLines(verse)).toEqual([
      'Maître Corbeau, sur un arbre perché,',
      'Tenait en son bec un fromage.',
    ]);
  });

  it('keeps the breaks in a list of short entries', () => {
    const contents = ['CHAPTER I.', 'CHAPTER II.', 'CHAPTER III.'].join('\n');

    expect(displayLines(contents)).toHaveLength(3);
  });

  it('leaves a single line alone', () => {
    expect(displayLines('One line only.')).toEqual(['One line only.']);
  });

  it('does not treat one long opening line as a wrapped paragraph on its own', () => {
    // A long first line followed by a short second is the ambiguous case; the
    // wrap reading is right far more often, and it is what a reader expects.
    const para = [
      'She had not a moment to think about stopping herself before she found',
      'herself falling down a very deep well.',
    ].join('\n');

    expect(displayLines(para)).toHaveLength(1);
  });

  it('keeps verse even when one line happens to be long', () => {
    const verse = [
      'If you can keep your head when all about you are losing theirs and blaming you,',
      'If you can trust yourself when all men doubt you,',
      'But make allowance for their doubting too;',
    ].join('\n');

    expect(displayLines(verse)).toHaveLength(3);
  });
});
