import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { signSession, setSessionCookie } from '@/lib/auth/session';

const Body = z.object({
  email: z.string().email().toLowerCase(),
  name: z.string().min(1).max(80),
  password: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check your details. Passwords need at least 8 characters.' },
      { status: 400 },
    );
  }

  const { email, name, password } = parsed.data;

  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: 'That email already has an account.' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { email, name, passwordHash: await hashPassword(password) },
    select: { id: true, email: true, name: true, role: true },
  });

  await setSessionCookie(await signSession({ sub: user.id, email: user.email, role: user.role }));
  return NextResponse.json({ user }, { status: 201 });
}
