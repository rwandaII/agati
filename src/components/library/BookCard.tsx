import Link from 'next/link';
import type { CSSProperties } from 'react';
import { formatRwf } from '@/config/pricing';
import type { BookSummary } from '@/lib/books';

export function accessBadge(book: { accessType: string; priceRwf: number }): {
  label: string;
  tone: 'free' | 'trial' | 'paid';
} {
  if (book.accessType === 'FREE_FOREVER') return { label: 'Free', tone: 'free' };
  if (book.accessType === 'FREE_TRIAL') return { label: '7 days free', tone: 'trial' };
  return { label: formatRwf(book.priceRwf), tone: 'paid' };
}

const LANGUAGE_LABEL: Record<string, string> = { EN: 'English', FR: 'Français', RW: 'Kinyarwanda' };

/** A small standing book: coloured cover, darker spine, title, access badge. */
export function BookCard({ book }: { book: BookSummary }) {
  const badge = accessBadge(book);

  return (
    <Link
      href={`/books/${book.slug}`}
      className="bookcard"
      style={{ '--cover': book.coverColor } as CSSProperties}
    >
      <span className="bookcard__cover" aria-hidden="true">
        <span className="bookcard__spine" />
        <span className="bookcard__coverTitle">{book.title}</span>
      </span>

      <span className="bookcard__meta">
        <span className="bookcard__title">{book.title}</span>
        <span className="bookcard__author">{book.author}</span>
        <span className="bookcard__foot">
          <span className={`badge badge--${badge.tone}`}>{badge.label}</span>
          <span className="bookcard__lang">{LANGUAGE_LABEL[book.language] ?? book.language}</span>
        </span>
      </span>
    </Link>
  );
}
