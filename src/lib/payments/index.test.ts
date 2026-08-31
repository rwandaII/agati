import { describe, it, expect, beforeEach } from 'vitest';
import { paymentProvider, resetProviderCache } from './index';

beforeEach(() => resetProviderCache());

describe('paymentProvider', () => {
  it('falls back to the mock with no credentials', () => {
    delete process.env.FLW_CLIENT_ID;
    delete process.env.FLW_CLIENT_SECRET;
    expect(paymentProvider().name).toBe('mock');
  });

  it('uses Flutterwave once credentials are set', () => {
    process.env.FLW_CLIENT_ID = 'id';
    process.env.FLW_CLIENT_SECRET = 'secret';
    expect(paymentProvider().name).toBe('flutterwave');
  });

  it('caches the choice', () => {
    process.env.FLW_CLIENT_ID = 'id';
    process.env.FLW_CLIENT_SECRET = 'secret';
    expect(paymentProvider()).toBe(paymentProvider());
  });
});
