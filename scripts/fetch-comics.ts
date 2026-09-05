import { writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * Comics for the Agati shelf.
 *
 * Everything here was published in the United States before 1931, which puts it
 * unambiguously in the public domain — US copyright runs 95 years from
 * publication, so as of 2026 anything published up to 1930 is free. Each item
 * additionally carries archive.org's Public Domain Mark, and the fetcher
 * refuses to seed anything that fails either check.
 *
 * That bright line matters. Archive.org is full of comics whose uploaders have
 * tagged them "public domain" while they are plainly still in copyright —
 * Tintin, Marvel, manga. Putting any of those on a site that charges money
 * would expose Agati to a real claim.
 *
 * Pages come from the item's image zip, which archive.org will serve entry by
 * entry. That is far more reliable than their IIIF service, which rate-limits
 * bulk reads into uselessness.
 */
const PUBLIC_DOMAIN_BEFORE = 1931;

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

export type WantedComic = {
  id: string;
  slug: string;
  title: string;
  author: string;
  published: number;
  summary: string;
  description: string;
  coverColor: string;
  featured?: boolean;
  maxPages?: number;
};

export const COMICS: WantedComic[] = [
  {
    id: 'LittleNemo1905-1914ByWinsorMccay',
    slug: 'little-nemo-in-slumberland',
    title: 'Little Nemo in Slumberland',
    author: 'Winsor McCay',
    published: 1905,
    coverColor: '#0071BA',
    featured: true,
    summary: 'A boy dreams his way into Slumberland, and falls out of bed in the last panel.',
    description:
      'Winsor McCay drew these full newspaper pages between 1905 and 1914, and few have improved on them since. Every week Nemo journeys towards Slumberland; every week the final panel tips him out of bed.',
    maxPages: 40,
  },
  {
    id: 'BringingUpFatherSeries1',
    slug: 'bringing-up-father',
    title: 'Bringing Up Father',
    author: 'George McManus',
    published: 1919,
    coverColor: '#FF8000',
    summary: 'Jiggs came into money. Maggie intends that he behave like it.',
    description:
      'One of the longest-running comic strips ever drawn: a bricklayer who strikes it rich, a wife determined to make him respectable, and a man who would rather eat corned beef with his friends.',
    maxPages: 40,
  },
  {
    id: 'WhenAFellerNeedsAFriend',
    slug: 'when-a-feller-needs-a-friend',
    title: 'When a Feller Needs a Friend',
    author: 'Clare Briggs',
    published: 1914,
    coverColor: '#80C203',
    summary: 'Small daily humiliations, drawn with enormous sympathy.',
    description:
      'Clare Briggs made a career of the moment when everything goes slightly wrong — and of the friend who turns up anyway.',
    maxPages: 40,
  },
  {
    id: 'CharlieChaplinsFunnyStuntsInFullColor',
    slug: 'charlie-chaplins-funny-stunts',
    title: "Charlie Chaplin's Funny Stunts",
    author: 'Essanay',
    published: 1917,
    coverColor: '#FF5600',
    summary: 'The Tramp, in full colour, falling over for your entertainment.',
    description: 'A 1917 comic book of Chaplin gags, printed while the films themselves were new.',
    maxPages: 30,
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get(url: string, attempts = 4): Promise<Response | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.ok) return res;
      if (res.status === 404) return null;
    } catch {
      /* transient */
    }
    if (i < attempts - 1) await sleep(1200 * 2 ** i);
  }
  return null;
}

type ArchiveMeta = {
  metadata?: Record<string, string>;
  files?: Array<{ name: string; format: string; size?: string }>;
};

/** Refuses anything that is not demonstrably out of copyright. */
async function verifyPublicDomain(comic: WantedComic): Promise<ArchiveMeta> {
  if (comic.published >= PUBLIC_DOMAIN_BEFORE) {
    throw new Error(
      `dated ${comic.published}; only pre-${PUBLIC_DOMAIN_BEFORE} works may be seeded`,
    );
  }

  const res = await get(`https://archive.org/metadata/${comic.id}`);
  if (!res) throw new Error('metadata unavailable');

  const meta = (await res.json()) as ArchiveMeta;
  const licence = meta.metadata?.licenseurl ?? '';
  if (!/publicdomain/i.test(licence)) {
    throw new Error(`no public-domain mark (licence: ${licence || 'none'})`);
  }
  return meta;
}

/**
 * The original scans live inside the item's image zip. Archive.org will list
 * that zip and serve each entry on its own, so we never download 300MB.
 */
async function listPageImages(id: string, meta: ArchiveMeta): Promise<string[]> {
  const zips = (meta.files ?? [])
    .filter((f) => /\.zip$/i.test(f.name) && !/_daisy|_jp2/i.test(f.name))
    .map((f) => f.name);

  for (const zip of zips) {
    const res = await get(`https://archive.org/download/${id}/${encodeURIComponent(zip)}/`);
    if (!res) continue;

    const html = await res.text();
    const hrefs = [...html.matchAll(/href="([^"]+\.(?:jpe?g|png))"/gi)]
      .map((m) => m[1])
      .filter((h) => h.includes('/download/'))
      .map((h) => (h.startsWith('//') ? `https:${h}` : h));

    if (hrefs.length >= 4) return hrefs;
  }
  return [];
}

/**
 * Fallback for items whose only scan is a JP2 zip. archive.org's IIIF service
 * will render those to JPEG, but it rate-limits hard, so this is patient.
 */
async function iiifPages(id: string, limit: number): Promise<Buffer[]> {
  const out: Buffer[] = [];

  for (let i = 1; i <= limit; i++) {
    // The IIIF identifier for page n of an item is `<id>$<n>` — the dollar is literal.
    const url = `https://iiif.archive.org/iiif/${id}$${i}/full/1100,/0/default.jpg`;
    let got: Buffer | null = null;

    for (let attempt = 0; attempt < 6 && !got; attempt++) {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': UA } });
        if (res.status === 404) return out; // past the last page
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length > 3000 && buf[0] === 0xff && buf[1] === 0xd8) got = buf;
        }
      } catch {
        /* transient */
      }
      if (!got) await sleep(2000 * (attempt + 1));
    }

    if (!got) break;
    out.push(got);
    if (out.length % 5 === 0) console.log(`    ${out.length} pages (iiif)`);
    await sleep(800);
  }

  return out;
}

async function main() {
  const force = process.argv.includes('--force');
  const outMeta = path.join(process.cwd(), 'src/content/comics');
  await mkdir(outMeta, { recursive: true });

  const failures: string[] = [];

  for (const comic of COMICS) {
    const imageDir = path.join(process.cwd(), 'public/comics', comic.slug);
    const metaPath = path.join(outMeta, `${comic.slug}.json`);

    if (!force && existsSync(metaPath)) {
      const have = existsSync(imageDir) ? (await readdir(imageDir)).length : 0;
      console.log(`- ${comic.title} ... have it (${have} pages)`);
      continue;
    }

    console.log(`- ${comic.title} (${comic.published}) ...`);

    try {
      const meta = await verifyPublicDomain(comic);
      const urls = await listPageImages(comic.id, meta);
      await mkdir(imageDir, { recursive: true });

      const want = comic.maxPages ?? 40;
      const pages: string[] = [];

      const save = async (buf: Buffer) => {
        const name = `${String(pages.length + 1).padStart(3, '0')}.jpg`;
        await writeFile(path.join(imageDir, name), buf);
        pages.push(`/comics/${comic.slug}/${name}`);
      };

      if (urls.length) {
        for (let i = 0; i < Math.min(want, urls.length); i++) {
          const res = await get(urls[i]);
          if (!res) continue;
          const buf = Buffer.from(await res.arrayBuffer());
          if (buf.length < 3000) continue;
          await save(buf);
          if (pages.length % 10 === 0) console.log(`    ${pages.length} pages`);
          await sleep(120);
        }
      } else {
        console.log('    no plain-image zip; falling back to IIIF');
        for (const buf of await iiifPages(comic.id, want)) await save(buf);
      }

      if (pages.length < 4) throw new Error(`only ${pages.length} pages came back`);

      const { id: _id, maxPages: _m, ...rest } = comic;
      await writeFile(
        metaPath,
        JSON.stringify(
          { ...rest, category: 'Comics', language: 'EN', archiveId: comic.id, pages },
          null,
          2,
        ),
        'utf8',
      );

      console.log(`    ${pages.length} pages saved`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`    SKIPPED — ${msg}`);
      failures.push(`${comic.title}: ${msg}`);
    }
  }

  if (failures.length) {
    console.log(`\n${failures.length} comic(s) could not be fetched:`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exitCode = 1;
  }
}

if (process.argv[1]?.includes('fetch-comics')) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
