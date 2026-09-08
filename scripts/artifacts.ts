/**
 * Marks Project Gutenberg leaves in the text that a reader should never see.
 *
 * Their transcriptions stand in for the original's engravings with the literal
 * words `[Illustration]`, sometimes carrying the plate's caption, and they mark
 * the printer's italics by fencing a word in underscores. Both are notation
 * about the book rather than the book, and on the page they read as damage:
 * Alice wonders whether the fall would `_never_` come to an end.
 *
 * Nothing here is guesswork about the prose — only the removal of a transcriber's
 * markup that has no meaning once the text is set in type again.
 */
export function stripGutenbergArtifacts(text: string): string {
  return (
    text
      // Plate placeholders, caption and all. The caption describes a picture
      // that was never scanned, so keeping it would only puzzle the reader.
      .replace(/\[Illustration[^\]]*\]/gi, '')
      // _italics_ back to plain words. Bounded so a stray underscore in the
      // middle of a page cannot swallow the paragraphs after it.
      .replace(/_([^_\n]{1,200})_/g, '$1')
      // Whatever those removals left behind: trailing space, and paragraph
      // gaps that now hold nothing.
      .replace(/[ \t]+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
}
