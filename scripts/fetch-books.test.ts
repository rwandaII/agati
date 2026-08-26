import { describe, it, expect } from 'vitest';
import { stripGutenbergBoilerplate, paginate } from './fetch-books';

describe('stripGutenbergBoilerplate', () => {
  it('removes header and footer, keeping only the work', () => {
    const raw = [
      'The Project Gutenberg eBook of Something',
      'legal blah blah',
      '*** START OF THE PROJECT GUTENBERG EBOOK SOMETHING ***',
      '',
      'Once upon a time.',
      '',
      '*** END OF THE PROJECT GUTENBERG EBOOK SOMETHING ***',
      'more legal text',
    ].join('\n');

    const out = stripGutenbergBoilerplate(raw);
    expect(out).toContain('Once upon a time.');
    expect(out).not.toContain('legal blah');
    expect(out).not.toContain('more legal text');
    expect(out).not.toMatch(/PROJECT GUTENBERG/i);
  });

  it('returns text unchanged when no markers are present', () => {
    expect(stripGutenbergBoilerplate('Just a story.')).toBe('Just a story.');
  });
});

describe('paginate', () => {
  it('never drops a paragraph', () => {
    const paras = Array.from({ length: 40 }, (_, i) => `Paragraph number ${i}.`);
    const rejoined = paginate(paras.join('\n\n'), 200).join('\n\n');
    for (const p of paras) expect(rejoined).toContain(p);
  });

  it('keeps pages near the target size', () => {
    const text = Array.from({ length: 60 }, () => 'x'.repeat(90)).join('\n\n');
    const pages = paginate(text, 400);
    expect(pages.length).toBeGreaterThan(5);
    for (const page of pages) expect(page.length).toBeLessThan(900);
  });

  it('starts a new page at a chapter heading', () => {
    const pages = paginate('Intro line.\n\nCHAPTER I\n\nThe story begins.', 5000);
    expect(pages.length).toBe(2);
    expect(pages[1].startsWith('CHAPTER I')).toBe(true);
  });
});
