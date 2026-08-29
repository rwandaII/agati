/** Update when the rate moves. RWF is what is charged; USD is only quoted. */
export const USD_TO_RWF = 1300;

export const PLANS = {
  YEARLY: { usd: 10, rwf: 10 * USD_TO_RWF, label: 'Year', months: 12 },
  MONTHLY: { usd: 1, rwf: 1 * USD_TO_RWF, label: 'Month', months: 1 },
} as const;

export type PlanKey = keyof typeof PLANS;

/** RWF is a zero-decimal currency: always whole francs. */
export function formatRwf(n: number): string {
  return `${Math.round(n).toLocaleString('en-US')} RWF`;
}

/** Calendar-correct month arithmetic: clamps to the last day of a shorter month. */
export function addMonths(d: Date, months: number): Date {
  const r = new Date(d.getTime());
  const day = r.getUTCDate();
  r.setUTCDate(1);
  r.setUTCMonth(r.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
  r.setUTCDate(Math.min(day, lastDay));
  return r;
}

export function subscriptionEnd(start: Date, plan: PlanKey): Date {
  return addMonths(start, PLANS[plan].months);
}
