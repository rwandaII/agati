export type RwandaPhone = {
  countryCode: '250';
  number: string;
  network: 'MTN' | 'AIRTEL';
};

const MTN = ['78', '79'];
const AIRTEL = ['72', '73'];

/**
 * Accepts 0788…, +250788…, 250788… or 788… and returns the 9-digit national
 * number, along with the network the prefix belongs to.
 */
export function normalizeRwandaPhone(raw: string): RwandaPhone | null {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (!digits) return null;

  let national = digits;
  if (national.startsWith('250')) national = national.slice(3);
  else if (national.startsWith('0')) national = national.slice(1);

  if (!/^7\d{8}$/.test(national)) return null;

  // 0788123456 -> national 788123456; the operator prefix is the first two digits.
  const prefix = national.slice(0, 2);
  const network = MTN.includes(prefix) ? 'MTN' : AIRTEL.includes(prefix) ? 'AIRTEL' : null;
  if (!network) return null;

  return { countryCode: '250', number: national, network };
}
