import { describe, it, expect, beforeAll, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: async () => ({ set: vi.fn(), get: vi.fn(), delete: vi.fn() }),
}));

const GOOD = 'test-secret-that-is-at-least-32-bytes-long!!';
beforeAll(() => { process.env.SESSION_SECRET = GOOD; });

const { signSession, verifySession } = await import('./session');

const payload = { sub: 'user_1', email: 'a@b.com', role: 'READER' as const };

describe('session', () => {
  it('round-trips a payload', async () => {
    const got = await verifySession(await signSession(payload));
    expect(got?.sub).toBe('user_1');
    expect(got?.role).toBe('READER');
    expect(got?.email).toBe('a@b.com');
  });

  it('rejects a tampered token', async () => {
    const [h, b, s] = (await signSession(payload)).split('.');
    expect(await verifySession(`${h}.${b}x.${s}`)).toBeNull();
  });

  it('rejects rubbish', async () => {
    expect(await verifySession('not-a-token')).toBeNull();
    expect(await verifySession('')).toBeNull();
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await signSession(payload);
    process.env.SESSION_SECRET = 'a-completely-different-secret-32-bytes-x';
    expect(await verifySession(token)).toBeNull();
    process.env.SESSION_SECRET = GOOD;
  });

  it('refuses to sign with a weak secret', async () => {
    process.env.SESSION_SECRET = 'short';
    await expect(signSession(payload)).rejects.toThrow(/32/);
    process.env.SESSION_SECRET = GOOD;
  });

  it('does not let a reader claim to be an admin', async () => {
    const got = await verifySession(await signSession({ ...payload, role: 'READER' }));
    expect(got?.role).toBe('READER');
  });
});
