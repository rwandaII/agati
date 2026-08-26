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
  pages: string[];
};
