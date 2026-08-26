import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { SeedBook } from '../src/content/types';

const START = /\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*/i;
const END = /\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG EBOOK.*?\*\*\*/i;
const CHAPTER = /^\s*(CHAPTER|BOOK|PART|FABLE|STORY|LIVRE|CHAPITRE)\b.{0,60}$/i;

export function stripGutenbergBoilerplate(raw: string): string {
  let text = raw.replace(/\r\n/g, '\n');
  const s = text.match(START);
  if (s?.index !== undefined) text = text.slice(s.index + s[0].length);
  const e = text.match(END);
  if (e?.index !== undefined) text = text.slice(0, e.index);
  return text.trim();
}

/** Split prose into page-sized chunks, breaking early at chapter headings. */
export function paginate(text: string, target = 1100): string[] {
  const paras = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/[ \t]+\n/g, '\n').trim())
    .filter(Boolean);

  const pages: string[] = [];
  let buf: string[] = [];
  let size = 0;

  const flush = () => {
    if (buf.length) {
      pages.push(buf.join('\n\n'));
      buf = [];
      size = 0;
    }
  };

  for (const para of paras) {
    if (CHAPTER.test(para) && buf.length) flush();
    buf.push(para);
    size += para.length + 2;
    if (size >= target) flush();
  }
  flush();
  return pages;
}

type Wanted = Omit<SeedBook, 'pages' | 'author'> & { search: string; author?: string };

const WANTED: Wanted[] = [
  {
    search: 'Aesop Fables Townsend',
    slug: 'aesops-fables',
    title: 'Aesop’s Fables',
    category: 'Folk tales',
    language: 'EN',
    accessType: 'FREE_FOREVER',
    priceRwf: 0,
    coverColor: '#1B3A2F',
    featured: true,
    summary: 'Short animal tales, each ending in a lesson worth carrying.',
    description:
      'The oldest collection of moral stories in the world, told a few lines at a time — the fox and the grapes, the tortoise and the hare, the lion and the mouse.',
  },
  {
    search: 'The Jungle Book Kipling',
    slug: 'the-jungle-book',
    title: 'The Jungle Book',
    category: 'Adventure',
    language: 'EN',
    accessType: 'FREE_FOREVER',
    priceRwf: 0,
    coverColor: '#2F4A2A',
    featured: true,
    summary: 'Mowgli grows up among wolves and learns the law of the jungle.',
    description:
      'Stories of a boy raised by wolves, a mongoose who guards a household, and a white seal searching for a safe shore.',
  },
  {
    search: 'Just So Stories Kipling',
    slug: 'just-so-stories',
    title: 'Just So Stories',
    category: 'Children’s',
    language: 'EN',
    accessType: 'FREE_FOREVER',
    priceRwf: 0,
    coverColor: '#5A3B22',
    summary: 'How the elephant got its trunk, and other cheerful impossibilities.',
    description:
      'Origin stories invented for a child, told aloud and meant to be read the same way.',
  },
  {
    search: 'Grimms Fairy Tales',
    slug: 'grimms-fairy-tales',
    title: 'Grimms’ Fairy Tales',
    category: 'Folk tales',
    language: 'EN',
    accessType: 'FREE_FOREVER',
    priceRwf: 0,
    coverColor: '#3B2A45',
    summary: 'The tales the brothers Grimm collected from the people who told them.',
    description: 'Two centuries of European storytelling, gathered from farmhouses and kitchens.',
  },
  {
    search: 'Alice Adventures in Wonderland',
    slug: 'alice-in-wonderland',
    title: 'Alice’s Adventures in Wonderland',
    category: 'Adventure',
    language: 'EN',
    accessType: 'FREE_FOREVER',
    priceRwf: 0,
    coverColor: '#417586',
    summary: 'A girl follows a hurrying rabbit and nothing behaves properly again.',
    description: 'Still the strangest journey in children’s literature.',
  },
  {
    search: 'The Wonderful Wizard of Oz',
    slug: 'wizard-of-oz',
    title: 'The Wonderful Wizard of Oz',
    category: 'Adventure',
    language: 'EN',
    accessType: 'FREE_FOREVER',
    priceRwf: 0,
    coverColor: '#2E5B4F',
    summary: 'A road of yellow brick, and four travellers who each want one thing.',
    description: 'Dorothy walks to the Emerald City with a scarecrow, a tin man and a lion.',
  },
  {
    search: 'The Wind in the Willows',
    slug: 'wind-in-the-willows',
    title: 'The Wind in the Willows',
    category: 'Adventure',
    language: 'EN',
    accessType: 'FREE_FOREVER',
    priceRwf: 0,
    coverColor: '#4A5D3A',
    summary: 'Mole, Rat, Badger and the impossible Mr Toad, on the riverbank.',
    description: 'A quiet classic about friendship, rivers, and knowing when to come home.',
  },
  {
    search: 'The Secret Garden Burnett',
    slug: 'the-secret-garden',
    title: 'The Secret Garden',
    category: 'Children’s',
    language: 'EN',
    accessType: 'FREE_FOREVER',
    priceRwf: 0,
    coverColor: '#3F6B4A',
    summary: 'A locked garden, a lonely child, and what grows when both are opened.',
    description: 'Mary Lennox finds a walled garden nobody has entered for ten years.',
  },
  {
    search: 'Fables de La Fontaine',
    slug: 'fables-de-la-fontaine',
    title: 'Fables de La Fontaine',
    category: 'Folk tales',
    language: 'FR',
    accessType: 'FREE_FOREVER',
    priceRwf: 0,
    coverColor: '#6B4A2F',
    summary: 'Les fables en vers, du corbeau et du renard à la cigale et la fourmi.',
    description:
      'Les fables les plus connues de la langue française, écrites pour être lues à voix haute.',
  },
  {
    search: 'Anne of Green Gables',
    slug: 'anne-of-green-gables',
    title: 'Anne of Green Gables',
    category: 'Children’s',
    language: 'EN',
    accessType: 'FREE_FOREVER',
    priceRwf: 0,
    coverColor: '#7A3B2E',
    summary: 'An orphan arrives at the wrong farm and refuses to be sent back.',
    description: 'Anne Shirley talks her way into a home, a school, and everyone’s affection.',
  },
];

type GutendexBook = {
  title: string;
  authors?: Array<{ name?: string }>;
  formats: Record<string, string>;
  languages?: string[];
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * gutenberg.org drops long-lived connections fairly often, so every network read
 * retries with backoff before giving up.
 */
async function fetchWithRetry(url: string, attempts = 5): Promise<Response> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: '*/*' } });
      if (res.ok) return res;
      // 4xx other than 429 will not improve with retrying
      if (res.status < 500 && res.status !== 429) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      lastError = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastError = err;
    }
    if (i < attempts - 1) await sleep(1200 * 2 ** i);
  }
  throw new Error(`Gave up on ${url}: ${lastError instanceof Error ? lastError.message : lastError}`);
}

async function fetchTextWithRetry(urls: string[]): Promise<string> {
  let lastError: unknown;
  for (const url of urls) {
    try {
      return await (await fetchWithRetry(url)).text();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

const STOPWORDS = new Set([
  'the', 'of', 'in', 'and', 'a', 'an', 'de', 'la', 'le', 'les', 'du', 'des', 'et',
]);

function significantWords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Gutendex ranks by relevance, and its top hit is sometimes a different book that
 * merely mentions the phrase. Score candidates on how much of the wanted title
 * they actually contain, so "The Wind in the Willows" cannot match Leroy Scott.
 */
function scoreCandidate(candidate: GutendexBook, wantTitle: string, wantLang: string): number {
  const wanted = significantWords(wantTitle);
  if (!wanted.length) return 0;

  const haystack = significantWords(candidate.title);
  const overlap = wanted.filter((w) => haystack.includes(w)).length / wanted.length;

  const langBonus = candidate.languages?.includes(wantLang) ? 0.5 : 0;
  const hasText = Object.keys(candidate.formats).some((k) => k.startsWith('text/plain')) ? 0.2 : 0;

  // Prefer the complete edition: "Fables de La Fontaine" over
  // "Fables de La Fontaine, livre premier", which is only the first book.
  const extraWords = haystack.filter((w) => !wanted.includes(w)).length;
  const partPenalty = Math.min(extraWords, 4) * 0.05;

  return overlap + langBonus + hasText - partPenalty;
}

async function resolveText(
  search: string,
  language: string,
  wantTitle: string,
): Promise<{ urls: string[]; author: string; matchedTitle: string }> {
  const wantLang = language.toLowerCase();
  const res = await fetchWithRetry(
    `https://gutendex.com/books?search=${encodeURIComponent(search)}&languages=${wantLang}`,
  );

  const json = (await res.json()) as { results?: GutendexBook[] };
  const results = json.results ?? [];
  if (!results.length) throw new Error(`No Gutendex result for "${search}"`);

  const ranked = results
    .map((r) => ({ r, score: scoreCandidate(r, wantTitle, wantLang) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  // Require at least half the significant words of the wanted title to be present.
  if (best.score < 0.7) {
    throw new Error(
      `Best Gutendex match for "${wantTitle}" was "${best.r.title}" (score ${best.score.toFixed(2)}) — refusing to seed the wrong book`,
    );
  }
  const hit = best.r;

  // Collect every plain-text URL as a fallback chain; mirrors differ in reliability.
  const urls = Object.keys(hit.formats)
    .filter((k) => k.startsWith('text/plain') && !String(hit.formats[k]).endsWith('.zip'))
    .sort((a, b) => Number(b.includes('utf-8')) - Number(a.includes('utf-8')))
    .map((k) => hit.formats[k]);

  if (!urls.length) throw new Error(`No plain-text format for "${search}"`);

  return { urls, author: hit.authors?.[0]?.name ?? 'Unknown', matchedTitle: hit.title };
}

/** Gutenberg author names come as "Kipling, Rudyard"; humans read them the other way. */
function humaniseAuthor(name: string): string {
  const m = name.match(/^([^,]+),\s*(.+?)(?:,\s*\d{4}.*)?$/);
  return m ? `${m[2].trim()} ${m[1].trim()}` : name.replace(/,\s*\d{4}.*$/, '').trim();
}

async function main() {
  const outDir = path.join(process.cwd(), 'src/content/books');
  await mkdir(outDir, { recursive: true });

  // Downloading from gutenberg.org is slow and flaky; do not repeat work.
  // Pass --force to refetch everything.
  const force = process.argv.includes('--force');
  const failures: string[] = [];

  for (const w of WANTED) {
    const outPath = path.join(outDir, `${w.slug}.json`);
    if (!force && existsSync(outPath)) {
      console.log(`- ${w.title} ... already downloaded`);
      continue;
    }

    console.log(`- ${w.title} ...`);
    try {
      const { urls, author, matchedTitle } = await resolveText(w.search, w.language, w.title);
      const raw = await fetchTextWithRetry(urls);
      const pages = paginate(stripGutenbergBoilerplate(raw));

      if (pages.length < 10) {
        throw new Error(`only ${pages.length} pages from "${matchedTitle}" — check the source`);
      }

      const { search: _drop, ...meta } = w;
      const book: SeedBook = { ...meta, author: w.author ?? humaniseAuthor(author), pages };

      await writeFile(outPath, JSON.stringify(book, null, 2), 'utf8');
      console.log(`${pages.length} pages  (${book.author})`);
    } catch (err) {
      // One bad title must not cost us the other nine.
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`SKIPPED — ${msg}`);
      failures.push(`${w.title}: ${msg}`);
    }
  }

  if (failures.length) {
    console.log(`\n${failures.length} title(s) could not be fetched:`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  }
}

if (process.argv[1]?.includes('fetch-books')) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
