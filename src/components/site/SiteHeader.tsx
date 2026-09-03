'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, type CSSProperties } from 'react';
import { PAGES } from '@/config/site';
import { LOGO_SEQUENCE } from '@/config/brand';
import { MARK_COLOUR } from '@/config/photos';

/** The site's own header: Agati's mark, the name, and the coloured section tabs. */
export function SiteHeader({ account }: { account?: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="site__header">
      <div className="site__bar">
        <Link className="site__brand" href="/" onClick={() => setOpen(false)}>
          <Image src={MARK_COLOUR} alt="" aria-hidden="true" width={46} height={47} priority />
          <span className="site__brandText">
            <span className="site__brandName">
              {[...'AGATI'].map((ch, i) => (
                <span key={i} style={{ color: LOGO_SEQUENCE[i % LOGO_SEQUENCE.length] }}>
                  {ch}
                </span>
              ))}
            </span>
            <span className="site__brandSub">Library</span>
          </span>
        </Link>

        <button
          type="button"
          className="site__burger"
          aria-expanded={open}
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? '✕' : '☰'}</span>
        </button>

        <nav className={`site__nav ${open ? 'site__nav--open' : ''}`} aria-label="Sections">
          {PAGES.map((p, i) => (
            <Link
              key={p.href}
              href={p.href}
              onClick={() => setOpen(false)}
              className={`site__tab ${isActive(p.href) ? 'site__tab--active' : ''}`}
              style={{ '--tab': LOGO_SEQUENCE[i % LOGO_SEQUENCE.length] } as CSSProperties}
              aria-current={isActive(p.href) ? 'page' : undefined}
            >
              {p.label}
            </Link>
          ))}
          <span className="site__account">{account}</span>
        </nav>
      </div>
    </header>
  );
}
