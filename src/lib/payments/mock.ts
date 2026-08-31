import type { ChargeInput, ChargeResult, ChargeStatus, PaymentProvider } from './types';

const APPROVAL_MS = 4000;

type Row = { input: ChargeInput; createdAt: number };

/**
 * Plays the exact shape of the real Mobile Money flow — pending, then approved
 * on the phone — so the whole product is demonstrable before a merchant account
 * exists. No real money moves.
 */
export class MockProvider implements PaymentProvider {
  readonly name = 'mock';
  private charges = new Map<string, Row>();

  async createCharge(input: ChargeInput): Promise<ChargeResult> {
    const chargeId = `mock_${input.reference}`;
    this.charges.set(chargeId, { input, createdAt: Date.now() });

    return {
      chargeId,
      status: 'pending',
      instruction: 'Check your phone and approve the payment request to continue.',
    };
  }

  async getCharge(chargeId: string): Promise<ChargeStatus> {
    const row = this.charges.get(chargeId);
    if (!row) throw new Error(`Unknown charge ${chargeId}`);

    return {
      chargeId,
      status: Date.now() - row.createdAt >= APPROVAL_MS ? 'succeeded' : 'pending',
      amountRwf: row.input.amountRwf,
      currency: 'RWF',
      reference: row.input.reference,
    };
  }

  verifyWebhook(): boolean {
    return true;
  }

  parseWebhook(rawBody: string) {
    try {
      const j = JSON.parse(rawBody);
      return { chargeId: j?.data?.id ?? '', reference: j?.data?.reference };
    } catch {
      return null;
    }
  }
}
