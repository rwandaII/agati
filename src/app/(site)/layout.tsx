import type { ReactNode } from 'react';
import './site.css';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { AccountLink } from '@/components/site/AccountLink';

/**
 * The website. An ordinary, scrollable, readable site.
 *
 * The book — closed cover, turning pages, two-page spread — belongs to the
 * books themselves, over in /read/[slug]. It is not the shape of the website.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site">
      <SiteHeader account={<AccountLink />} />
      <main className="site__main" id="page-content">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
