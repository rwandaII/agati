'use client';

import { useState, type ReactNode } from 'react';
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
  // Closed from the very first paint, so reloading a book shows you the book
  // and not a glimpse of its pages first. The pages are still rendered and
  // still in the HTML for search engines — the cover lies over them.
  const [isOpen, setIsOpen] = useState(() => opened.has(slug));

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
