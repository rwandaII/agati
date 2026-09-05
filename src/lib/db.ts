import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaTuned?: boolean;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Let many people read at once.
 *
 * SQLite's default rollback journal takes a whole-database lock for every
 * write, so one reader saving their place blocks everybody else's page. WAL
 * lets readers carry on while a write is in flight, which is the difference
 * between a library that serves one person and one that serves a classroom.
 *
 * `busy_timeout` then makes a writer wait its turn instead of failing outright.
 * SQLite still allows only one writer at a time — for real scale the answer is
 * Postgres, which is a one-line change in schema.prisma (see docs/DEPLOY.md).
 */
if (!globalForPrisma.prismaTuned && process.env.DATABASE_URL?.startsWith('file:')) {
  globalForPrisma.prismaTuned = true;
  void (async () => {
    try {
      await prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL;');
      await prisma.$executeRawUnsafe('PRAGMA busy_timeout = 5000;');
      await prisma.$executeRawUnsafe('PRAGMA synchronous = NORMAL;');
    } catch {
      // Not fatal: the app works without it, just with less overlap.
    }
  })();
}
