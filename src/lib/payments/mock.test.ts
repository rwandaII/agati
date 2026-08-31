import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockProvider } from './mock';

const input = {
  reference: 'agati_test_1', amountRwf: 2500, phone: '0788123456',
  email: 'a@b.com', name: 'Test Reader', description: 'A Book',
};

describe('MockProvider', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts a charge as pending with an instruction for the phone', async () => {
    const r = await new MockProvider().createCharge(input);
    expect(r.status).toBe('pending');
    expect(r.chargeId).toMatch(/^mock_/);
    expect(r.instruction).toMatch(/phone/i);
  });

  it('succeeds once the customer has had time to approve', async () => {
    const p = new MockProvider();
    const { chargeId } = await p.createCharge(input);
    expect((await p.getCharge(chargeId)).status).toBe('pending');

    vi.advanceTimersByTime(5000);
    const done = await p.getCharge(chargeId);
    expect(done.status).toBe('succeeded');
    expect(done.amountRwf).toBe(2500);
    expect(done.currency).toBe('RWF');
    expect(done.reference).toBe('agati_test_1');
  });

  it('throws on an unknown charge', async () => {
    await expect(new MockProvider().getCharge('nope')).rejects.toThrow();
  });

  it('accepts any webhook, since there is nothing to forge against', () => {
    expect(new MockProvider().verifyWebhook()).toBe(true);
  });
});
