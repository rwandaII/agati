'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { PAGES, pageIndex } from '@/config/site';
import { LOGO_SEQUENCE } from '@/config/brand';

/**
 * Section tabs along the head of the book, each in one of the logo's colours —
 * so the navigation carries the identity. Real links, so they work without JS.
 */
export function Ribbons() {
  const pathname = usePathname();
  const active = pageIndex(pathname);

  return (
    <nav className="ribbons" aria-label="Sections">
      {PAGES.map((p, i) => (
        <Link
          key={p.href}
          href={p.href}
          className={`ribbon ${i === active ? 'ribbon--active' : ''}`}
          style={{ '--ribbon': LOGO_SEQUENCE[i % LOGO_SEQUENCE.length] } as CSSProperties}
          aria-current={i === active ? 'page' : undefined}
        >
          <span className="ribbon__label">{p.label}</span>
        </Link>
      ))}
    </nav>
  );
}
