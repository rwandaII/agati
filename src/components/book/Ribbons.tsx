'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { PAGES, pageIndex } from '@/config/site';

const HUES = ['#C9A227', '#8A5A3B', '#417586', '#5E7A4A', '#8B4A57', '#4A4E7A'];

/** Silk bookmarks hanging from the head of the book. Real links, so they work without JS. */
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
          style={{ '--ribbon': HUES[i % HUES.length] } as CSSProperties}
          aria-current={i === active ? 'page' : undefined}
        >
          <span className="ribbon__label">{p.label}</span>
        </Link>
      ))}
    </nav>
  );
}
