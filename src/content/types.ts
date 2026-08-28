export type SeedBook = {
  slug: string;
  title: string;
  author: string;
  summary: string;
  description: string;
  category: string;
  language: 'EN' | 'FR' | 'RW';
  accessType: 'FREE_FOREVER' | 'FREE_TRIAL' | 'PAID';
  priceRwf: number;
  coverColor: string;
  featured?: boolean;
  /** Days of free reading once a reader first opens a FREE_TRIAL book. */
  freeTrialDays?: number;
  /** Pages readable without any entitlement at all. */
  previewPages?: number;
  pages: string[];
};
