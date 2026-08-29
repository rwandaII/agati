import { describe, it, expect, afterAll, vi } from 'vitest';
import { prisma } from '@/lib/db';

vi.mock('next/headers', () => ({
  cookies: async () => ({ set: vi.fn(), get: vi.fn(), delete: vi.fn() }),
}));

process.env.SESSION_SECRET ||= 'test-secret-that-is-at-least-32-bytes-long!!';

const { POST } = await import('./route');

const post = (body: unknown) =>
  POST(new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }));

describe('POST /api/auth/register', () => {
  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: 'regtest' } } });
    await prisma.$disconnect();
  });

  it('creates an account and never returns the hash', async () => {
    const res = await post({ email: 'regtest1@x.com', name: 'Reg', password: 'longenough123' });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.user.email).toBe('regtest1@x.com');
    expect(JSON.stringify(json)).not.toMatch(/passwordHash|longenough123/);
  });

  it('rejects a duplicate email', async () => {
    await post({ email: 'regtest2@x.com', name: 'Reg', password: 'longenough123' });
    const res = await post({ email: 'regtest2@x.com', name: 'Reg', password: 'longenough123' });
    expect(res.status).toBe(409);
  });

  it('rejects a short password', async () => {
    expect((await post({ email: 'regtest3@x.com', name: 'Reg', password: 'short' })).status).toBe(400);
  });

  it('rejects a malformed email', async () => {
    expect((await post({ email: 'not-an-email', name: 'Reg', password: 'longenough123' })).status).toBe(400);
  });

  it('lowercases the email so it cannot be duplicated by case', async () => {
    await post({ email: 'regtest4@x.com', name: 'Reg', password: 'longenough123' });
    expect((await post({ email: 'REGTEST4@X.COM', name: 'Reg', password: 'longenough123' })).status).toBe(409);
  });
});
