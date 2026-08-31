import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';

const getCharge = vi.fn();
const fulfilPurchase = vi.fn();

vi.mock('@/lib/payments', () => ({
  paymentProvider: () => ({
    name: 'flutterwave',
    getCharge,
    verifyWebhook: (raw: string, sig: string | null) => {
      if (!sig) return false;
      const expected = crypto.createHmac('sha256', 'hash-abc').update(raw, 'utf8').digest('hex');
      return expected === sig;
    },
    parseWebhook: (raw: string) => {
      try {
        return { chargeId: JSON.parse(raw).data.id };
      } catch {
        return null;
      }
    },
  }),
}));

vi.mock('@/lib/payments/fulfil', () => ({ fulfilPurchase }));

const { POST } = await import('./route');

const body = JSON.stringify({ type: 'charge.completed', data: { id: 'chg_1' } });

const sign = (b: string, secret = 'hash-abc') =>
  crypto.createHmac('sha256', secret).update(b, 'utf8').digest('hex');

const post = (raw: string, sig: string | null) =>
  POST(
    new Request('http://localhost/api/webhooks/flutterwave', {
      method: 'POST',
      headers: sig ? { 'flutterwave-signature': sig } : {},
      body: raw,
    }),
  );

beforeEach(() => {
  getCharge.mockReset();
  fulfilPurchase.mockReset().mockResolvedValue('fulfilled');
  getCharge.mockResolvedValue({
    chargeId: 'chg_1',
    status: 'succeeded',
    amountRwf: 2500,
    currency: 'RWF',
    reference: 'agati_bk_1',
  });
});

describe('POST /api/webhooks/flutterwave', () => {
  it('fulfils a correctly signed event', async () => {
    const res = await post(body, sign(body));
    expect(res.status).toBe(200);
    expect(fulfilPurchase).toHaveBeenCalledWith(
      'agati_bk_1',
      expect.objectContaining({ status: 'succeeded', amountRwf: 2500 }),
    );
  });

  it('rejects an unsigned request and fulfils nothing', async () => {
    expect((await post(body, null)).status).toBe(401);
    expect(fulfilPurchase).not.toHaveBeenCalled();
  });

  it('rejects a signature made with the wrong secret', async () => {
    expect((await post(body, sign(body, 'wrong'))).status).toBe(401);
    expect(fulfilPurchase).not.toHaveBeenCalled();
  });

  it('rejects a tampered body', async () => {
    const sig = sign(body);
    const tampered = JSON.stringify({ type: 'charge.completed', data: { id: 'chg_EVIL' } });
    expect((await post(tampered, sig)).status).toBe(401);
    expect(fulfilPurchase).not.toHaveBeenCalled();
  });

  it('re-queries the charge instead of trusting the payload', async () => {
    const lying = JSON.stringify({
      type: 'charge.completed',
      data: { id: 'chg_1', amount: 999999, status: 'succeeded', reference: 'attacker_ref' },
    });

    await post(lying, sign(lying));

    expect(getCharge).toHaveBeenCalledWith('chg_1');
    // The lie in the payload never reaches fulfilment.
    expect(fulfilPurchase).toHaveBeenCalledWith(
      'agati_bk_1',
      expect.objectContaining({ amountRwf: 2500 }),
    );
  });

  it('answers 200 to a replay so the provider stops retrying', async () => {
    fulfilPurchase.mockResolvedValue('already');
    expect((await post(body, sign(body))).status).toBe(200);
  });

  it('answers 200 for an unknown reference', async () => {
    fulfilPurchase.mockResolvedValue('unknown');
    expect((await post(body, sign(body))).status).toBe(200);
  });

  it('rejects a body it cannot parse', async () => {
    const junk = 'not json';
    expect((await post(junk, sign(junk))).status).toBe(400);
    expect(fulfilPurchase).not.toHaveBeenCalled();
  });
});
