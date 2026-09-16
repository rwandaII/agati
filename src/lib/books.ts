import type { Prisma } from '@prisma/client';
import { prisma } from './db';

export type BookFilter = {
  q?: string;
  language?: 'EN' | 'FR' | 'RW';
  category?: string;
  access?: 'free' | 'paid';
};

const SUMMARY = {
  id: true,
  slug: true,
  title: true,
  author: true,
  summary: true,
  coverColor: true,
  language: true,
  category: true,
  accessType: true,
  priceRwf: true,
  pageCount: true,
  featured: true,
} satisfies Prisma.BookSelect;

export type BookSummary = Prisma.BookGetPayload<{ select: typeof SUMMARY }>;

export async function listBooks(f: BookFilter): Promise<BookSummary[]> {
  const where: Prisma.BookWhereInput = {};

  if (f.language) where.language = f.language;
  if (f.category) where.category = f.category;
  if (f.access === 'free') where.accessType = 'FREE_FOREVER';
  if (f.access === 'paid') where.accessType = { in: ['PAID', 'FREE_TRIAL'] };

  // Postgres LIKE is case sensitive, so a reader typing "alice" would miss
  // "Alice". mode: 'insensitive' asks for ILIKE instead.
  if (f.q?.trim()) {
    const q = f.q.trim();
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { author: { contains: q, mode: 'insensitive' } },
      { summary: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
    ];
  }

  return prisma.book.findMany({
    where,
    select: SUMMARY,
    orderBy: [{ featured: 'desc' }, { title: 'asc' }],
  });
}

export function getBook(slug: string) {
  return prisma.book.findUnique({ where: { slug } });
}

export async function categories(): Promise<string[]> {
  const rows = await prisma.book.findMany({
    distinct: ['category'],
    select: { category: true },
    orderBy: { category: 'asc' },
  });
  return rows.map((r) => r.category);
}

export async function languages(): Promise<string[]> {
  const rows = await prisma.book.findMany({
    distinct: ['language'],
    select: { language: true },
    orderBy: { language: 'asc' },
  });
  return rows.map((r) => r.language);
}
