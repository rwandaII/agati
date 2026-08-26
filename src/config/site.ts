/** The book's page order. Turning forward moves down this list. */
export const PAGES = [
  { href: '/', label: 'Home', running: 'Agati Library', folio: 2 },
  { href: '/about', label: 'About', running: 'About Us', folio: 4 },
  { href: '/programs', label: 'Programs', running: 'Our Programs', folio: 6 },
  { href: '/news', label: 'News', running: 'What We Have Done', folio: 8 },
  { href: '/library', label: 'Library', running: 'The Collection', folio: 10 },
  { href: '/contact', label: 'Contact', running: 'Get In Touch', folio: 12 },
] as const;

export type BookPage = (typeof PAGES)[number];

/** Which spread a path belongs to. Returns -1 for pages outside the book's spine. */
export function pageIndex(pathname: string): number {
  const exact = PAGES.findIndex((p) => p.href === pathname);
  if (exact !== -1) return exact;

  return PAGES.findIndex((p) => p.href !== '/' && pathname.startsWith(p.href));
}
