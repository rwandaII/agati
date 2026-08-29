import { describe, it, expect } from 'vitest';
import { PLANS, USD_TO_RWF, formatRwf, addMonths, subscriptionEnd } from './pricing';

describe('plans', () => {
  it('charges $10 a year, as agreed', () => {
    expect(PLANS.YEARLY.usd).toBe(10);
  });

  it('converts every plan to whole francs - RWF has no decimals', () => {
    for (const plan of Object.values(PLANS)) {
      expect(Number.isInteger(plan.rwf)).toBe(true);
      expect(plan.rwf).toBe(Math.round(plan.usd * USD_TO_RWF));
    }
  });

  it('leaves the yearly plan cheaper than twelve monthly payments', () => {
    expect(PLANS.YEARLY.rwf).toBeLessThan(PLANS.MONTHLY.rwf * 12);
  });
});

describe('formatRwf', () => {
  it('groups thousands and names the currency', () => {
    expect(formatRwf(13000)).toBe('13,000 RWF');
    expect(formatRwf(0)).toBe('0 RWF');
    expect(formatRwf(1500)).toBe('1,500 RWF');
  });
});

describe('addMonths', () => {
  it('adds a plain month', () => {
    expect(addMonths(new Date('2026-01-15T00:00:00Z'), 1).toISOString()).toBe('2026-02-15T00:00:00.000Z');
  });

  it('clamps the 31st to the last day of a shorter month', () => {
    expect(addMonths(new Date('2026-01-31T00:00:00Z'), 1).toISOString()).toBe('2026-02-28T00:00:00.000Z');
  });

  it('handles a leap year', () => {
    expect(addMonths(new Date('2028-01-31T00:00:00Z'), 1).toISOString()).toBe('2028-02-29T00:00:00.000Z');
  });

  it('rolls over the year end', () => {
    expect(addMonths(new Date('2026-12-10T00:00:00Z'), 1).toISOString()).toBe('2027-01-10T00:00:00.000Z');
  });

  it('clamps 29 February when adding twelve months', () => {
    expect(addMonths(new Date('2028-02-29T00:00:00Z'), 12).toISOString()).toBe('2029-02-28T00:00:00.000Z');
  });
});

describe('subscriptionEnd', () => {
  it('gives a year for the yearly plan', () => {
    expect(subscriptionEnd(new Date('2026-08-31T00:00:00Z'), 'YEARLY').toISOString()).toBe('2027-08-31T00:00:00.000Z');
  });

  it('gives a month for the monthly plan', () => {
    expect(subscriptionEnd(new Date('2026-08-31T00:00:00Z'), 'MONTHLY').toISOString()).toBe('2026-09-30T00:00:00.000Z');
  });
});
