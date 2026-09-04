import type { ReactNode } from 'react';
import { BookShell } from '@/components/book/BookShell';
import { AccountRibbon } from '@/components/book/AccountRibbon';

/**
 * The website is one big book, filling the screen: every section is a spread,
 * and moving between sections turns a page.
 *
 * Reading an actual book from the collection is deliberately NOT inside this —
 * that route brings its own, smaller, bound volume.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <BookShell accountMark={<AccountRibbon />}>{children}</BookShell>;
}
