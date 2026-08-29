import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { readSession } from './session';

export async function currentUser() {
  const s = await readSession();
  if (!s) return null;
  return prisma.user.findUnique({ where: { id: s.sub } });
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'ADMIN') redirect('/');
  return user;
}
