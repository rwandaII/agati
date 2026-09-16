import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/auth/guards';

/** Cap per book. More marks than this is a filing cabinet, not a book. */
const MOST_MARKS = 50;

const Add = z.object({
  slug: z.string().min(1),
  anchor: z.number().int().min(0),
  label: z.string().min(1).max(160),
});

async function bookFor(slug: string) {
  return prisma.book.findUnique({ where: { slug }, select: { id: true } });
}

/** A reader's marks in one book, in the order they come in it. */
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ bookmarks: [] });

  const slug = new URL(req.url).searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const book = await bookFor(slug);
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: user.id, bookId: book.id },
    orderBy: { anchor: 'asc' },
    select: { id: true, anchor: true, label: true, createdAt: true },
  });

  return NextResponse.json({ bookmarks });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to keep a mark' }, { status: 401 });

  const parsed = Add.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const book = await bookFor(parsed.data.slug);
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const where = { userId: user.id, bookId: book.id };

  // marking the same place twice moves the mark, it doesn't stack two
  const existing = await prisma.bookmark.findFirst({
    where: { ...where, anchor: parsed.data.anchor },
    select: { id: true },
  });
  if (existing) {
    const bookmark = await prisma.bookmark.update({
      where: { id: existing.id },
      data: { label: parsed.data.label },
      select: { id: true, anchor: true, label: true, createdAt: true },
    });
    return NextResponse.json({ bookmark });
  }

  if ((await prisma.bookmark.count({ where })) >= MOST_MARKS) {
    return NextResponse.json(
      { error: `That is ${MOST_MARKS} marks in one book. Remove one first.` },
      { status: 409 },
    );
  }

  const bookmark = await prisma.bookmark.create({
    data: { ...where, anchor: parsed.data.anchor, label: parsed.data.label },
    select: { id: true, anchor: true, label: true, createdAt: true },
  });

  return NextResponse.json({ bookmark }, { status: 201 });
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  // scoped to the owner, so an id on its own can't delete someone else's mark
  const { count } = await prisma.bookmark.deleteMany({ where: { id, userId: user.id } });
  if (!count) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
