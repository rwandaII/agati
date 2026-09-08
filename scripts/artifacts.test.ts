import { describe, expect, it } from 'vitest';
import { stripGutenbergArtifacts } from './artifacts';

describe('stripGutenbergArtifacts', () => {
  it('removes a bare plate placeholder', () => {
    expect(stripGutenbergArtifacts('Before.\n\n[Illustration]\n\nAfter.')).toBe('Before.\n\nAfter.');
  });

  it('removes a placeholder together with its caption', () => {
    expect(stripGutenbergArtifacts('[Illustration: LIVRE 1.]\n\nJe chante les héros')).toBe(
      'Je chante les héros',
    );
  });

  it('unfences italics', () => {
    expect(stripGutenbergArtifacts('Would the fall _never_ come to an end?')).toBe(
      'Would the fall never come to an end?',
    );
  });

  it('leaves an unpaired underscore alone', () => {
    expect(stripGutenbergArtifacts('a _ b')).toBe('a _ b');
  });

  it('does not let one underscore swallow the rest of the page', () => {
    const long = `_${'x'.repeat(400)}_`;
    expect(stripGutenbergArtifacts(long)).toBe(long);
  });

  it('leaves ordinary prose untouched', () => {
    const prose = 'The rabbit-hole went straight on like a tunnel for some way.';
    expect(stripGutenbergArtifacts(prose)).toBe(prose);
  });

  it('keeps paragraph structure when a plate sat between paragraphs', () => {
    const input = 'One.\n\n[Illustration: FABLES]\n\nTwo.\n\n[Illustration]\n\nThree.';
    expect(stripGutenbergArtifacts(input)).toBe('One.\n\nTwo.\n\nThree.');
  });
});
