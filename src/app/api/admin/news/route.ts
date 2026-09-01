import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/guards';

const Body = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  body: z.string().min(1),
  category: z.string().min(1),
  publishedAt: z.string().optional(),
  featured: z.boolean().default(false),
});

export async function POST(req: Request) {
  await requireAdmin();

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid post' }, { status: 400 });

  if (await prisma.newsPost.findUnique({ where: { slug: parsed.data.slug } })) {
    return NextResponse.json({ error: 'That slug is already taken.' }, { status: 409 });
  }

  const { publishedAt, ...rest } = parsed.data;
  const post = await prisma.newsPost.create({
    data: { ...rest, publishedAt: publishedAt ? new Date(publishedAt) : new Date() },
  });

  return NextResponse.json({ post: { id: post.id, slug: post.slug } }, { status: 201 });
}

const Patch = Body.partial().extend({ id: z.string().min(1) });

export async function PATCH(req: Request) {
  await requireAdmin();

  const parsed = Patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid update' }, { status: 400 });

  const { id, publishedAt, ...rest } = parsed.data;

  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.newsPost.update({
    where: { id },
    data: { ...rest, ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {}) },
  });

  return NextResponse.json({ ok: true });
}
