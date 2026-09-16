/**
 * Telling a line break that means something from one the wrap put there.
 *
 * Gutenberg files are hard wrapped at about 70 characters, so a prose paragraph
 * arrives already broken into lines, and honouring those breaks turns a novel
 * into ragged half sentences. But the same files carry verse, where every break
 * is the poet's, and tables of contents, where every break is an entry.
 *
 * The two are easy to tell apart by shape. A machine wraps at a fixed width, so
 * every line of wrapped prose runs nearly to the margin and only the last falls
 * short. Verse scatters.
 */

/** Below this, a line was ended by a person rather than by the wrap width. */
const WRAPPED_AT_LEAST = 55;

/**
 * The lines to render for one paragraph. Wrapped prose collapses to a single
 * line, verse comes back as written.
 */
export function displayLines(paragraph: string): string[] {
  const lines = paragraph.split('\n');
  if (lines.length < 2) return lines;

  // the last line of a wrapped paragraph is short by definition, so it says
  // nothing about how the paragraph was broken. Every other line does.
  const wrapped = lines
    .slice(0, -1)
    .every((line) => line.trim().length >= WRAPPED_AT_LEAST);

  return wrapped ? [lines.map((line) => line.trim()).join(' ')] : lines;
}
