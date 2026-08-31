export type PayStatus = 'pending' | 'succeeded' | 'failed';

export type ChargeInput = {
  reference: string;
  amountRwf: number;
  phone: string;
  email: string;
  name: string;
  description: string;
};

export type ChargeResult = {
  chargeId: string;
  status: PayStatus;
  redirectUrl?: string;
  instruction?: string;
};

export type ChargeStatus = {
  chargeId: string;
  status: PayStatus;
  amountRwf: number;
  currency: string;
  reference: string;
};

/** Nothing outside src/lib/payments knows which processor is in use. */
export interface PaymentProvider {
  readonly name: string;
  createCharge(input: ChargeInput): Promise<ChargeResult>;
  getCharge(chargeId: string): Promise<ChargeStatus>;
  verifyWebhook(rawBody: string, signature: string | null): boolean;
  parseWebhook(rawBody: string): { chargeId: string; reference?: string } | null;
}
