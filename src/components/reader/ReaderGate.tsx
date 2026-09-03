'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { BookCover } from './BookCover';

/**
 * Shows a book's own closed cover before its pages.
 *
 * The set lives in module scope, so the cover greets you each time the app is
 * started or the page reloaded, but does not shut itself again while you move
 * around inside the book.
 */
const opened = new Set<string>();

export function ReaderGate({
  slug,
  title,
  author,
  coverColor,
  coverImage,
  category,
  badge,
  children,
}: {
  slug: string;
  title: string;
  author: string;
  coverColor: string;
  coverImage?: string | null;
  category: string;
  badge?: string;
  children: ReactNode;
}) {
  // Assume open during SSR so the pages are in the HTML for search engines.
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    setIsOpen(opened.has(slug));
  }, [slug]);

  return (
    <>
      {children}
      {isOpen ? null : (
        <BookCover
          title={title}
          author={author}
          coverColor={coverColor}
          coverImage={coverImage}
          category={category}
          badge={badge}
          onOpen={() => {
            opened.add(slug);
            setIsOpen(true);
          }}
        />
      )}
    </>
  );
}
