import Link from 'next/link';
import type { CSSProperties } from 'react';
import { PAGES } from '@/config/site';
import { LOGO_SEQUENCE } from '@/config/brand';

/**
 * The one tab a book needs.
 *
 * The website's full set of section tabs belongs to the website. Inside a book
 * they're clutter across the head of the page, so only the way out stays.
 */
export function HomeTab() {
  const home = PAGES[0];

  return (
    <nav className="ribbons ribbons--reading" aria-label="Leave the book">
      <Link
        href={home.href}
        className="ribbon"
        style={{ '--ribbon': LOGO_SEQUENCE[0] } as CSSProperties}
      >
        <span className="ribbon__label">{home.label}</span>
      </Link>
    </nav>
  );
}
