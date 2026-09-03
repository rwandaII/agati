import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import type { SeedBook } from '../src/content/types';
import { WANTED, type Wanted } from './wanted-books';

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

type Candidate = { urls: string[]; author: string; matchedTitle: string };

async function resolveCandidates(
  search: string,
  language: string,
  wantTitle: string,
): Promise<Candidate[]> {
  const wantLang = language.toLowerCase();
  const res = await fetchWithRetry(
    `https://gutendex.com/books?search=${encodeURIComponent(search)}&languages=${wantLang}`,
  );

  const json = (await res.json()) as { results?: GutendexBook[] };
  const results = json.results ?? [];
  if (!results.length) throw new Error(`No Gutendex result for "${search}"`);

  const ranked = results
    .map((r) => ({ r, score: scoreCandidate(r, wantTitle, wantLang) }))
    .sort((a, b) => b.score - a.score)
    .filter((x) => x.score >= 0.7); // never seed a book that is not the one asked for

  if (!ranked.length) {
    const best = results
      .map((r) => ({ r, score: scoreCandidate(r, wantTitle, wantLang) }))
      .sort((a, b) => b.score - a.score)[0];
    throw new Error(
      `Best Gutendex match for "${wantTitle}" was "${best.r.title}" (score ${best.score.toFixed(2)}) — refusing to seed the wrong book`,
    );
  }

  return ranked.slice(0, 5).map(({ r: hit }) => {

    // Every plain-text URL, best encoding first; mirrors differ in reliability.
    const urls = Object.keys(hit.formats)
      .filter((k) => k.startsWith('text/plain') && !String(hit.formats[k]).endsWith('.zip'))
      .sort((a, b) => Number(b.includes('utf-8')) - Number(a.includes('utf-8')))
      .map((k) => hit.formats[k]);

    return { urls, author: hit.authors?.[0]?.name ?? 'Unknown', matchedTitle: hit.title };
  }).filter((cand) => cand.urls.length > 0);
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
      const existing = JSON.parse(await readFile(outPath, 'utf8')) as SeedBook;
      const { search: _s, ...meta } = w;
      const refreshed: SeedBook = { ...existing, ...meta, author: w.author ?? existing.author };
      await writeFile(outPath, JSON.stringify(refreshed, null, 2), 'utf8');
      console.log(`- ${w.title} ... have it (${existing.pages.length} pages, ${w.category})`);
      continue;
    }

    console.log(`- ${w.title} ...`);
    try {
      const candidates = await resolveCandidates(w.search, w.language, w.title);

      let pages: string[] = [];
      let author = '';
      let matchedTitle = '';
      const tried: string[] = [];

      for (const cand of candidates) {
        try {
          const raw = await fetchTextWithRetry(cand.urls);
          const got = paginate(stripGutenbergBoilerplate(raw));
          tried.push(`"${cand.matchedTitle}" -> ${got.length}p`);
          if (got.length >= 10) {
            pages = got;
            author = cand.author;
            matchedTitle = cand.matchedTitle;
            break;
          }
        } catch {
          tried.push(`"${cand.matchedTitle}" -> unreachable`);
        }
      }

      if (pages.length < 10) {
        throw new Error(`no usable edition. Tried: ${tried.join('; ')}`);
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
