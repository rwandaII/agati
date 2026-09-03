import { stripGutenbergBoilerplate, paginate } from './fetch-books';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36';

async function main() {
  const t = await (
    await fetch('https://www.gutenberg.org/ebooks/74.txt.utf-8', { headers: { 'User-Agent': UA } })
  ).text();

  console.log('raw           :', t.length);
  const s = stripGutenbergBoilerplate(t);
  console.log('after strip   :', s.length);
  console.log('strip head    :', JSON.stringify(s.slice(0, 90)));
  console.log('paragraphs    :', s.split(/\n\s*\n/).filter(Boolean).length);
  const pages = paginate(s);
  console.log('pages         :', pages.length);
  console.log('first page len:', pages[0]?.length);
}

main();
