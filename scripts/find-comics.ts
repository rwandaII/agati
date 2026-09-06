/**
 * Finds archive.org items we can actually use as comics.
 *
 * Two hard requirements: published before 1931 (so unambiguously public
 * domain), and carrying a plain image zip. Items whose only scan is a JP2 zip
 * are rejected — the only way to render those is archive.org's IIIF service,
 * which rate-limits to roughly one page a minute.
 */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

type Doc = { identifier: string; title?: string; year?: number; date?: string };

async function search(query: string, rows = 40): Promise<Doc[]> {
  const url =
    'https://archive.org/advancedsearch.php?q=' +
    encodeURIComponent(query) +
    '&fl[]=identifier&fl[]=title&fl[]=year&fl[]=date&sort[]=downloads+desc&rows=' +
    rows +
    '&page=1&output=json';
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return [];
  const json = (await res.json()) as { response?: { docs?: Doc[] } };
  return json.response?.docs ?? [];
}

async function usable(id: string): Promise<{ ok: boolean; why: string; pages?: number }> {
  try {
    const res = await fetch(`https://archive.org/metadata/${id}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) return { ok: false, why: `metadata ${res.status}` };

    const meta = (await res.json()) as {
      metadata?: Record<string, string>;
      files?: Array<{ name: string; format: string }>;
    };

    const licence = meta.metadata?.licenseurl ?? '';
    if (!/publicdomain/i.test(licence)) return { ok: false, why: 'no PD mark' };

    const zips = (meta.files ?? [])
      .filter((f) => /\.zip$/i.test(f.name) && !/_daisy|_jp2/i.test(f.name))
      .map((f) => f.name);
    if (!zips.length) return { ok: false, why: 'jp2 only' };

    for (const zip of zips) {
      const list = await fetch(
        `https://archive.org/download/${id}/${encodeURIComponent(zip)}/`,
        { headers: { 'User-Agent': UA } },
      );
      if (!list.ok) continue;
      const html = await list.text();
      const n = [...html.matchAll(/href="[^"]+\.(?:jpe?g|png)"/gi)].length;
      if (n >= 6) return { ok: true, why: zip, pages: n };
    }
    return { ok: false, why: 'zip has no images' };
  } catch (e) {
    return { ok: false, why: e instanceof Error ? e.message : 'error' };
  }
}

async function main() {
  const queries = [
    'mediatype:texts AND date:[1900-01-01 TO 1930-12-31] AND (comic OR cartoons OR "comic strips")',
    'mediatype:texts AND date:[1900-01-01 TO 1930-12-31] AND subject:(comics)',
    'mediatype:texts AND date:[1900-01-01 TO 1930-12-31] AND title:(funnies OR cartoon OR comics)',
  ];

  const seen = new Set<string>();
  const good: string[] = [];

  for (const q of queries) {
    for (const d of await search(q)) {
      if (seen.has(d.identifier)) continue;
      seen.add(d.identifier);

      const year = d.year ?? (d.date ? Number(String(d.date).slice(0, 4)) : NaN);
      if (!Number.isFinite(year) || year >= 1931) continue;

      const check = await usable(d.identifier);
      const mark = check.ok ? 'USABLE' : '      ';
      console.log(
        `${mark} ${String(year)} ${d.identifier.slice(0, 42).padEnd(44)} ${check.ok ? check.pages + 'p' : check.why}  ${String(d.title ?? '').slice(0, 40)}`,
      );
      if (check.ok) good.push(`${d.identifier}  (${year}, ${check.pages} pages) — ${d.title}`);
    }
  }

  console.log(`\n${good.length} usable item(s):`);
  for (const g of good) console.log('  ' + g);
}

main();
