import type { PaymentProvider } from './types';
import { MockProvider } from './mock';
import { FlutterwaveProvider } from './flutterwave';

let cached: PaymentProvider | null = null;

/** Real Flutterwave when credentials are present; the mock otherwise. */
export function paymentProvider(): PaymentProvider {
  if (cached) return cached;

  const { FLW_CLIENT_ID, FLW_CLIENT_SECRET } = process.env;
  cached = FLW_CLIENT_ID && FLW_CLIENT_SECRET ? new FlutterwaveProvider() : new MockProvider();

  if (cached.name === 'mock') {
    console.warn(
      '[payments] No Flutterwave credentials found - running in MOCK mode. ' +
        'No real money will move. See docs/PAYMENTS.md.',
    );
  }
  return cached;
}

/** Tests only. */
export function resetProviderCache() {
  cached = null;
}
