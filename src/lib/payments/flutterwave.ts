import crypto from 'node:crypto';
import type {
  ChargeInput,
  ChargeResult,
  ChargeStatus,
  PayStatus,
  PaymentProvider,
} from './types';
import { normalizeRwandaPhone } from './phone';

const TOKEN_URL = 'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token';
const SANDBOX = 'https://developersandbox-api.flutterwave.com';
const PRODUCTION = 'https://api.flutterwave.com';

function mapStatus(s: string): PayStatus {
  if (s === 'succeeded' || s === 'successful') return 'succeeded';
  if (s === 'failed' || s === 'cancelled') return 'failed';
  return 'pending';
}

/**
 * Flutterwave v4, for MTN and Airtel Mobile Money in Rwanda.
 *
 *   token -> POST /customers -> POST /payment-methods -> POST /charges
 *                                                     -> GET  /charges/{id}
 *
 * Amounts are always whole RWF read from our own database.
 */
export class FlutterwaveProvider implements PaymentProvider {
  readonly name = 'flutterwave';
  private token: { value: string; expiresAt: number } | null = null;

  private get base(): string {
    return process.env.FLW_ENV === 'production' ? PRODUCTION : SANDBOX;
  }

  /** Tokens live ten minutes; refresh a minute early. */
  private async accessToken(): Promise<string> {
    if (this.token && Date.now() < this.token.expiresAt) return this.token.value;

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.FLW_CLIENT_ID ?? '',
        client_secret: process.env.FLW_CLIENT_SECRET ?? '',
        grant_type: 'client_credentials',
      }),
    });
    if (!res.ok) throw new Error(`Flutterwave auth failed (${res.status})`);

    const json = await res.json();
    const ttl = Number(json.expires_in ?? 600);
    this.token = { value: json.access_token, expiresAt: Date.now() + (ttl - 60) * 1000 };
    return this.token.value;
  }

  private async call<T>(
    path: string,
    init: RequestInit & { idempotencyKey?: string } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${await this.accessToken()}`,
      'Content-Type': 'application/json',
      'X-Trace-Id': crypto.randomUUID(),
    };
    if (init.idempotencyKey) headers['X-Idempotency-Key'] = init.idempotencyKey;

    const res = await fetch(`${this.base}${path}`, { ...init, headers });
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(`Flutterwave ${path} failed (${res.status}): ${JSON.stringify(json)}`);
    }
    return (json?.data ?? json) as T;
  }

  async createCharge(input: ChargeInput): Promise<ChargeResult> {
    const phone = normalizeRwandaPhone(input.phone);
    if (!phone) throw new Error('That phone number is not a valid Rwandan mobile number.');

    const [first, ...rest] = input.name.trim().split(/\s+/);

    const customer = await this.call<{ id: string }>('/customers', {
      method: 'POST',
      idempotencyKey: `${input.reference}-cus`,
      body: JSON.stringify({
        email: input.email,
        name: { first, last: rest.join(' ') || first },
        phone: { country_code: phone.countryCode, number: phone.number },
      }),
    });

    const method = await this.call<{ id: string }>('/payment-methods', {
      method: 'POST',
      idempotencyKey: `${input.reference}-pmd`,
      body: JSON.stringify({
        type: 'mobile_money',
        mobile_money: {
          country_code: phone.countryCode,
          network: phone.network,
          phone_number: phone.number,
        },
      }),
    });

    const charge = await this.call<{
      id: string;
      status: string;
      next_action?: {
        type: string;
        redirect_url?: { url: string };
        payment_instruction?: unknown;
      };
    }>('/charges', {
      method: 'POST',
      idempotencyKey: `${input.reference}-chg`,
      body: JSON.stringify({
        currency: 'RWF',
        amount: Math.round(input.amountRwf), // RWF is zero-decimal
        customer_id: customer.id,
        payment_method_id: method.id,
        reference: input.reference,
      }),
    });

    return {
      chargeId: charge.id,
      status: mapStatus(charge.status),
      redirectUrl: charge.next_action?.redirect_url?.url,
      instruction: charge.next_action?.redirect_url
        ? undefined
        : 'Check your phone and approve the payment request to continue.',
    };
  }

  async getCharge(chargeId: string): Promise<ChargeStatus> {
    const d = await this.call<{
      id: string;
      status: string;
      amount: number;
      currency: string;
      reference: string;
    }>(`/charges/${chargeId}`);

    return {
      chargeId: d.id,
      status: mapStatus(d.status),
      amountRwf: Math.round(d.amount),
      currency: d.currency,
      reference: d.reference,
    };
  }

  /** HMAC-SHA256 over the RAW body, compared in constant time. */
  verifyWebhook(rawBody: string, signature: string | null): boolean {
    const secret = process.env.FLW_SECRET_HASH;
    if (!secret || !signature) return false;

    const expected = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signature, 'utf8');

    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }

  parseWebhook(rawBody: string) {
    try {
      const j = JSON.parse(rawBody);
      const id = j?.data?.id;
      return id ? { chargeId: String(id), reference: j?.data?.reference } : null;
    } catch {
      return null;
    }
  }
}
