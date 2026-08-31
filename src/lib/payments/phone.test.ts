import { describe, it, expect } from 'vitest';
import { normalizeRwandaPhone } from './phone';

describe('normalizeRwandaPhone', () => {
  it.each([
    ['0788123456', '788123456'],
    ['+250788123456', '788123456'],
    ['250788123456', '788123456'],
    ['788123456', '788123456'],
    ['078 812 3456', '788123456'],
    ['+250 (788) 123-456', '788123456'],
  ])('normalises %s', (input, expected) => {
    expect(normalizeRwandaPhone(input)?.number).toBe(expected);
  });

  it('always reports Rwanda', () => {
    expect(normalizeRwandaPhone('0788123456')?.countryCode).toBe('250');
  });

  it('recognises MTN prefixes', () => {
    expect(normalizeRwandaPhone('0788123456')?.network).toBe('MTN');
    expect(normalizeRwandaPhone('0791234567')?.network).toBe('MTN');
  });

  it('recognises Airtel prefixes', () => {
    expect(normalizeRwandaPhone('0731234567')?.network).toBe('AIRTEL');
    expect(normalizeRwandaPhone('0721234567')?.network).toBe('AIRTEL');
  });

  it.each(['', '12345', '0688123456', 'not a phone', '07881234567890', '0701234567'])(
    'rejects %s',
    (bad) => expect(normalizeRwandaPhone(bad)).toBeNull(),
  );
});
