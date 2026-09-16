/**
 * Strips Project Gutenberg transcription markup from the text: [Illustration]
 * placeholders and _underscore italics_. Both read as damage once the text is
 * set again, and neither is part of the book.
 */
export function stripGutenbergArtifacts(text: string): string {
  return (
    text
      // caption and all. It describes a plate that was never scanned.
      .replace(/\[Illustration[^\]]*\]/gi, '')
      // _italics_ back to plain words. Bounded, or a stray underscore eats the
      // rest of the page.
      .replace(/_([^_\n]{1,200})_/g, '$1')
      // tidy up what the removals left behind
      .replace(/[ \t]+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}
