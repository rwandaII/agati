import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { signSession, setSessionCookie } from '@/lib/auth/session';

const Body = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

/** Same message for "no such user" and "wrong password", on purpose. */
const REJECT = { error: 'That email and password do not match.' };

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(REJECT, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return NextResponse.json(REJECT, { status: 401 });

  if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json(REJECT, { status: 401 });
  }

  await setSessionCookie(await signSession({ sub: user.id, email: user.email, role: user.role }));
  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
