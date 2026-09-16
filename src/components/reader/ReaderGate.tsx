'use client';

import { useState, type ReactNode } from 'react';
import { BookCover } from './BookCover';

/**
 * Shows a book's own closed cover before its pages. The set is module scope, so
 * the cover greets you on each load but doesn't shut itself again while you
 * move around inside the book.
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
  // closed from the very first paint, so reloading a book doesn't flash its
  // pages first. They're still rendered and still in the HTML for search
  // engines, the cover just lies over them.
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
