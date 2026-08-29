import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password', () => {
  it('never stores the plain text', async () => {
    const hash = await hashPassword('umuhanda-123');
    expect(hash).not.toContain('umuhanda-123');
    expect(hash.length).toBeGreaterThan(30);
  });

  it('accepts the right password', async () => {
    expect(await verifyPassword('umuhanda-123', await hashPassword('umuhanda-123'))).toBe(true);
  });

  it('rejects the wrong password', async () => {
    expect(await verifyPassword('wrong', await hashPassword('umuhanda-123'))).toBe(false);
  });

  it('produces a different hash each time (salted)', async () => {
    expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
  });
});
