import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { currentUser } from '@/lib/auth/guards';

const Body = z.object({ slug: z.string().min(1), pageIndex: z.number().int().min(0) });

/** Saving a place is a convenience, not a requirement: never an error when signed out. */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return new NextResponse(null, { status: 204 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const book = await prisma.book.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true },
  });
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.readingProgress.upsert({
    where: { userId_bookId: { userId: user.id, bookId: book.id } },
    update: { pageIndex: parsed.data.pageIndex },
    create: { userId: user.id, bookId: book.id, pageIndex: parsed.data.pageIndex },
  });

  return NextResponse.json({ ok: true });
}
