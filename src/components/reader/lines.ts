/**
 * Telling a line break that means something from one that does not.
 *
 * Project Gutenberg files are hard-wrapped at about seventy characters, so a
 * prose paragraph arrives already broken into lines. Honouring those breaks
 * turns a novel into ragged half-sentences. But the same files carry verse,
 * where every break is the poet's, and a table of contents, where every break
 * is an entry — flattening those is just as wrong.
 *
 * The two are easy to tell apart by shape. A machine wraps at a fixed width, so
 * every line of wrapped prose runs nearly to the margin and only the last falls
 * short. A person writing verse ends lines where the line ends, so the lengths
 * scatter and most are well short of the margin.
 */

/** Below this, a line was ended by a person rather than by the wrap width. */
const WRAPPED_AT_LEAST = 55;

/**
 * The lines to render for one paragraph.
 *
 * Wrapped prose comes back as a single line; verse comes back as written.
 */
export function displayLines(paragraph: string): string[] {
  const lines = paragraph.split('\n');
  if (lines.length < 2) return lines;

  // The last line of a wrapped paragraph is short by definition, so it says
  // nothing about how the paragraph was broken; every other line does.
  const wrapped = lines
    .slice(0, -1)
    .every((line) => line.trim().length >= WRAPPED_AT_LEAST);

  return wrapped ? [lines.map((line) => line.trim()).join(' ')] : lines;
}
