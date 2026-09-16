import type { ReactNode } from 'react';
import { BookShell } from '@/components/book/BookShell';
import { AccountRibbon } from '@/components/book/AccountRibbon';

/**
 * The site itself is the big book: every section is a spread, and moving
 * between sections turns a page.
 *
 * Reading an actual book from the collection is deliberately not inside this.
 * /read brings its own smaller volume.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <BookShell accountMark={<AccountRibbon />}>{children}</BookShell>;
}
