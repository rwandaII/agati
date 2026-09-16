import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { SeedBook, SeedComic } from '../src/content/types';
import { ORIGINALS } from '../src/content/originals';
import { NEWS } from '../src/content/news';

const prisma = new PrismaClient();

async function loadFetchedBooks(): Promise<SeedBook[]> {
  const dir = path.join(process.cwd(), 'src/content/books');
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
  } catch {
    console.warn('No downloaded books found. Run `npm run fetch:books` first.');
    return [];
  }
  return Promise.all(
    files.map(async (f) => JSON.parse(await readFile(path.join(dir, f), 'utf8')) as SeedBook),
  );
}

/** Comics have no text of their own, the page is the image. */
async function loadComics(): Promise<SeedComic[]> {
  const dir = path.join(process.cwd(), 'src/content/comics');
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.json'));
  } catch {
    return [];
  }
  return Promise.all(
    files.map(async (f) => JSON.parse(await readFile(path.join(dir, f), 'utf8')) as SeedComic),
  );
}

async function upsertComic(c: SeedComic) {
  const { pages, published, archiveId, ...meta } = c;

  const book = await prisma.book.upsert({
    where: { slug: c.slug },
    update: { ...meta, format: 'COMIC', accessType: 'FREE_FOREVER', priceRwf: 0, pageCount: pages.length },
    create: { ...meta, format: 'COMIC', accessType: 'FREE_FOREVER', priceRwf: 0, pageCount: pages.length },
  });

  await prisma.bookPage.deleteMany({ where: { bookId: book.id } });
  await prisma.bookPage.createMany({
    data: pages.map((image, index) => ({ bookId: book.id, index, content: '', image })),
  });

  return book;
}

async function upsertBook(b: SeedBook) {
  const { pages, ...meta } = b;

  const book = await prisma.book.upsert({
    where: { slug: b.slug },
    update: { ...meta, pageCount: pages.length },
    create: { ...meta, pageCount: pages.length },
  });

  // wipe and rewrite, so re-seeding can't leave stale pages behind
  await prisma.bookPage.deleteMany({ where: { bookId: book.id } });
  await prisma.bookPage.createMany({
    data: pages.map((content, index) => ({ bookId: book.id, index, content })),
  });

  return book;
}

async function main() {
  const books = [...(await loadFetchedBooks()), ...ORIGINALS];

  for (const b of books) {
    const saved = await upsertBook(b);
    console.log(
      `  ${saved.title.padEnd(38)} ${String(b.pages.length).padStart(4)} pages  ${b.accessType}`,
    );
  }

  const comics = await loadComics();
  for (const c of comics) {
    const saved = await upsertComic(c);
    console.log(`  ${saved.title.padEnd(38)} ${String(c.pages.length).padStart(4)} pages  COMIC`);
  }

  for (const n of NEWS) {
    const data = { ...n, publishedAt: new Date(n.publishedAt) };
    await prisma.newsPost.upsert({
      where: { slug: n.slug },
      update: data,
      create: data,
    });
  }

  await prisma.user.upsert({
    where: { email: 'admin@agatilibrary.org' },
    update: {},
    create: {
      email: 'admin@agatilibrary.org',
      name: 'Agati Admin',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('changeme123', 10),
    },
  });

  const pageCount = await prisma.bookPage.count();
  console.log(
    `\nSeeded ${books.length} books and ${comics.length} comics (${pageCount} pages), plus ${NEWS.length} news posts.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
