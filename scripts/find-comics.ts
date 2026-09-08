/**
 * Finds archive.org items usable as comics.
 *
 * Three hard requirements: published before 1931 (unambiguously public domain),
 * a public-domain mark, and page images we can actually reach. Items archive.org
 * scanned itself store pages as JP2, which can only be rendered through their
 * IIIF service — that throttles to roughly a page a minute, so those are
 * rejected. What works is items uploaded as plain JPEGs, which archive.org will
 * serve out of the zip one entry at a time.
 */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

type Doc = { identifier: string; title?: string; year?: number; date?: string };

async function search(query: string, rows: number): Promise<Doc[]> {
  const url =
    'https://archive.org/advancedsearch.php?q=' +
    encodeURIComponent(query) +
    '&fl[]=identifier&fl[]=title&fl[]=year&fl[]=date&sort[]=downloads+desc&rows=' +
    rows +
    '&page=1&output=json';
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    const json = (await res.json()) as { response?: { docs?: Doc[] } };
    return json.response?.docs ?? [];
  } catch {
    return [];
  }
}

async function usable(id: string): Promise<number | null> {
  try {
    const res = await fetch(`https://archive.org/metadata/${id}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;

    const meta = (await res.json()) as {
      metadata?: Record<string, string>;
      files?: Array<{ name: string; format: string }>;
    };

    if (!/publicdomain/i.test(meta.metadata?.licenseurl ?? '')) return null;

    // Loose page images beat a zip, and both beat JP2.
    const loose = (meta.files ?? []).filter(
      (f) => /\.(jpe?g|png)$/i.test(f.name) && !/thumb|preview|__ia|itemimage/i.test(f.name),
    );
    if (loose.length >= 6) return loose.length;

    const zips = (meta.files ?? [])
      .filter((f) => /\.zip$/i.test(f.name) && !/_daisy|_jp2/i.test(f.name))
      .map((f) => f.name);

    for (const zip of zips) {
      const list = await fetch(`https://archive.org/download/${id}/${encodeURIComponent(zip)}/`, {
        headers: { 'User-Agent': UA },
      });
      if (!list.ok) continue;
      const n = [...(await list.text()).matchAll(/href="[^"]+\.(?:jpe?g|png)"/gi)].length;
      if (n >= 6) return n;
    }
    return null;
  } catch {
    return null;
  }
}

const QUERIES = [
  'mediatype:image AND date:[1890-01-01 TO 1930-12-31] AND (comic OR "comic strip" OR cartoons)',
  'mediatype:image AND (comic OR "comic strip") AND licenseurl:(*publicdomain*)',
  'mediatype:texts AND date:[1890-01-01 TO 1930-12-31] AND ("comic strip" OR "sunday comics" OR funnies)',
  '(mediatype:image OR mediatype:texts) AND subject:("comic strips") AND licenseurl:(*publicdomain*)',
  '(mediatype:image OR mediatype:texts) AND (mccay OR outcault OR herriman OR opper OR dirks OR swinnerton)',
  'mediatype:texts AND collection:opensource AND (comic OR cartoons) AND date:[1890-01-01 TO 1930-12-31]',
];

async function main() {
  const seen = new Set<string>();
  const good: Array<{ id: string; year: number; pages: number; title: string }> = [];

  for (const q of QUERIES) {
    for (const d of await search(q, 60)) {
      if (seen.has(d.identifier)) continue;
      seen.add(d.identifier);

      const year = d.year ?? (d.date ? Number(String(d.date).slice(0, 4)) : NaN);
      if (!Number.isFinite(year) || year < 1830 || year >= 1931) continue;

      const pages = await usable(d.identifier);
      if (pages) {
        good.push({ id: d.identifier, year, pages, title: String(d.title ?? '') });
        console.log(
          `USABLE ${year} ${d.identifier.slice(0, 44).padEnd(46)} ${String(pages).padStart(4)}p  ${String(d.title ?? '').slice(0, 46)}`,
        );
      }
    }
  }

  console.log(`\nchecked ${seen.size} items, ${good.length} usable`);
}

main();
