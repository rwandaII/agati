import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import { FlutterwaveProvider } from './flutterwave';

const input = {
  reference: 'agati_bk_1',
  amountRwf: 2500,
  phone: '0788123456',
  email: 'r@agati.org',
  name: 'Test Reader',
  description: 'A Book',
};

function stubFetch(handlers: Record<string, unknown>) {
  return vi.fn(async (url: string | URL) => {
    const u = String(url);
    const key = Object.keys(handlers).find((k) => u.includes(k));
    if (!key) throw new Error(`Unexpected fetch: ${u}`);
    return {
      ok: true,
      status: 200,
      json: async () => handlers[key],
      text: async () => JSON.stringify(handlers[key]),
    } as Response;
  });
}

const HAPPY = {
  'openid-connect/token': { access_token: 'tok_123', expires_in: 600 },
  '/customers': { status: 'success', data: { id: 'cus_1' } },
  '/payment-methods': { status: 'success', data: { id: 'pmd_1' } },
  '/charges': {
    status: 'success',
    data: {
      id: 'chg_1',
      status: 'pending',
      next_action: { type: 'redirect_url', redirect_url: { url: 'https://flw.test/approve' } },
    },
  },
};

beforeEach(() => {
  process.env.FLW_ENV = 'sandbox';
  process.env.FLW_CLIENT_ID = 'id';
  process.env.FLW_CLIENT_SECRET = 'secret';
  process.env.FLW_SECRET_HASH = 'hash-abc';
});

describe('FlutterwaveProvider.createCharge', () => {
  it('walks customer then payment method then charge, and returns the redirect', async () => {
    const f = stubFetch(HAPPY);
    vi.stubGlobal('fetch', f);

    const r = await new FlutterwaveProvider().createCharge(input);
    expect(r).toMatchObject({
      chargeId: 'chg_1',
      status: 'pending',
      redirectUrl: 'https://flw.test/approve',
    });

    const urls = f.mock.calls.map((c) => String(c[0]));
    expect(urls[0]).toContain('openid-connect/token');
    expect(urls[1]).toContain('/customers');
    expect(urls[2]).toContain('/payment-methods');
    expect(urls[3]).toContain('/charges');
  });

  it('sends whole francs in RWF', async () => {
    const f = stubFetch(HAPPY);
    vi.stubGlobal('fetch', f);
    await new FlutterwaveProvider().createCharge(input);

    const body = JSON.parse(String((f.mock.calls[3][1] as RequestInit).body));
    expect(body.amount).toBe(2500);
    expect(body.currency).toBe('RWF');
    expect(body.reference).toBe('agati_bk_1');
    expect(Number.isInteger(body.amount)).toBe(true);
  });

  it('sends the detected network and the 9-digit national number', async () => {
    const f = stubFetch(HAPPY);
    vi.stubGlobal('fetch', f);
    await new FlutterwaveProvider().createCharge(input);

    const body = JSON.parse(String((f.mock.calls[2][1] as RequestInit).body));
    expect(body.mobile_money).toMatchObject({
      country_code: '250',
      network: 'MTN',
      phone_number: '788123456',
    });
  });

  it('routes an Airtel number to Airtel', async () => {
    const f = stubFetch(HAPPY);
    vi.stubGlobal('fetch', f);
    await new FlutterwaveProvider().createCharge({ ...input, phone: '0731234567' });

    const body = JSON.parse(String((f.mock.calls[2][1] as RequestInit).body));
    expect(body.mobile_money.network).toBe('AIRTEL');
  });

  it('sends an idempotency key derived from the reference', async () => {
    const f = stubFetch(HAPPY);
    vi.stubGlobal('fetch', f);
    await new FlutterwaveProvider().createCharge(input);

    const headers = (f.mock.calls[3][1] as RequestInit).headers as Record<string, string>;
    expect(headers['X-Idempotency-Key']).toContain('agati_bk_1');
    expect(headers['Authorization']).toBe('Bearer tok_123');
    expect(headers['X-Trace-Id']).toBeTruthy();
  });

  it('reuses the cached token across calls', async () => {
    const f = stubFetch(HAPPY);
    vi.stubGlobal('fetch', f);

    const p = new FlutterwaveProvider();
    await p.createCharge(input);
    await p.createCharge({ ...input, reference: 'agati_bk_2' });

    const tokenCalls = f.mock.calls.filter((c) => String(c[0]).includes('openid-connect/token'));
    expect(tokenCalls).toHaveLength(1);
  });

  it('refuses a phone number that is not a Rwandan mobile', async () => {
    vi.stubGlobal('fetch', stubFetch(HAPPY));
    await expect(
      new FlutterwaveProvider().createCharge({ ...input, phone: '12345' }),
    ).rejects.toThrow(/phone/i);
  });

  it('uses the production host only when told to', async () => {
    process.env.FLW_ENV = 'production';
    const f = stubFetch(HAPPY);
    vi.stubGlobal('fetch', f);

    await new FlutterwaveProvider().createCharge(input);

    const apiCalls = f.mock.calls
      .map((c) => String(c[0]))
      .filter((u) => u.startsWith('https://api.flutterwave.com'));
    expect(apiCalls.length).toBeGreaterThan(0);
  });

  it('uses the sandbox host by default', async () => {
    const f = stubFetch(HAPPY);
    vi.stubGlobal('fetch', f);

    await new FlutterwaveProvider().createCharge(input);

    expect(
      f.mock.calls.some((c) => String(c[0]).includes('developersandbox-api.flutterwave.com')),
    ).toBe(true);
  });
});

describe('FlutterwaveProvider.getCharge', () => {
  it('maps a succeeded charge', async () => {
    vi.stubGlobal(
      'fetch',
      stubFetch({
        'openid-connect/token': { access_token: 't', expires_in: 600 },
        '/charges/chg_1': {
          status: 'success',
          data: {
            id: 'chg_1',
            status: 'succeeded',
            amount: 2500,
            currency: 'RWF',
            reference: 'agati_bk_1',
          },
        },
      }),
    );

    expect(await new FlutterwaveProvider().getCharge('chg_1')).toMatchObject({
      status: 'succeeded',
      amountRwf: 2500,
      currency: 'RWF',
      reference: 'agati_bk_1',
    });
  });

  it.each([
    ['failed', 'failed'],
    ['pending', 'pending'],
    ['something_odd', 'pending'],
  ])('maps upstream %s to %s', async (upstream, expected) => {
    vi.stubGlobal(
      'fetch',
      stubFetch({
        'openid-connect/token': { access_token: 't', expires_in: 600 },
        '/charges/chg_1': {
          status: 'success',
          data: { id: 'chg_1', status: upstream, amount: 1, currency: 'RWF', reference: 'r' },
        },
      }),
    );

    expect((await new FlutterwaveProvider().getCharge('chg_1')).status).toBe(expected);
  });
});

describe('FlutterwaveProvider.verifyWebhook', () => {
  const body = JSON.stringify({ type: 'charge.completed', data: { id: 'chg_1' } });
  const sign = (b: string, secret: string) =>
    crypto.createHmac('sha256', secret).update(b).digest('hex');

  it('accepts a correctly signed body', () => {
    expect(new FlutterwaveProvider().verifyWebhook(body, sign(body, 'hash-abc'))).toBe(true);
  });

  it('rejects a tampered body', () => {
    expect(new FlutterwaveProvider().verifyWebhook(body + ' ', sign(body, 'hash-abc'))).toBe(false);
  });

  it('rejects a signature made with the wrong secret', () => {
    expect(new FlutterwaveProvider().verifyWebhook(body, sign(body, 'wrong'))).toBe(false);
  });

  it('rejects a missing signature', () => {
    expect(new FlutterwaveProvider().verifyWebhook(body, null)).toBe(false);
    expect(new FlutterwaveProvider().verifyWebhook(body, '')).toBe(false);
  });

  it('rejects when no secret hash is configured', () => {
    delete process.env.FLW_SECRET_HASH;
    expect(new FlutterwaveProvider().verifyWebhook(body, sign(body, 'hash-abc'))).toBe(false);
  });
});
