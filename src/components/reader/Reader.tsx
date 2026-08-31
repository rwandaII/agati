'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Leaf } from '@/components/book/Leaf';
import { useFlip } from '@/components/book/useFlip';
import { turnDuration } from '@/components/book/constants';
import { fitParagraphs } from '@/lib/reader/paginate';
import { useMeasurer } from './useMeasurer';
import { Paywall } from './Paywall';
import type { AccessReason } from '@/lib/access/resolve';

type Page = { index: number; content: string };

type Book = {
  slug: string;
  title: string;
  author: string;
  priceRwf: number;
  accessType: 'FREE_FOREVER' | 'FREE_TRIAL' | 'PAID';
  pageCount: number;
};

const CHAPTER = /^\s*(CHAPTER|BOOK|PART|FABLE|STORY|LIVRE|CHAPITRE|\*\*)/i;
const FETCH_AHEAD = 6;
const WINDOW = 24;

/** One printed page of the reader. */
function PageBody({ text, folio }: { text: string | null; folio: number | null }) {
  if (text === null) {
    return (
      <>
        <div className="page__body" />
        <footer className="page__folio">&nbsp;</footer>
      </>
    );
  }

  const paras = text.split(/\n\s*\n/).filter(Boolean);
  const opensChapter = paras.length > 0 && CHAPTER.test(paras[0]);

  return (
    <>
      <div className={`page__body ${opensChapter ? '' : 'page__body--chapter'}`}>
        {paras.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <footer className="page__folio">{folio}</footer>
    </>
  );
}

export function Reader({
  book,
  pages: initialPages,
  canRead,
  reason: initialReason,
  previewPages,
  trialEndsAt,
  startPage,
  signedIn,
}: {
  book: Book;
  pages: Page[];
  canRead: boolean;
  reason: AccessReason;
  previewPages: number;
  trialEndsAt: string | null;
  startPage: number;
  signedIn: boolean;
}) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [reason, setReason] = useState<AccessReason>(initialReason);
  const [blocked, setBlocked] = useState(!canRead);
  const [spread, setSpread] = useState(() => Math.floor(startPage / 2));
  const [turn, setTurn] = useState<{ dir: 1 | -1; from: number; to: number } | null>(null);

  const rightPageRef = useRef<HTMLElement | null>(null);
  const { measure, ready, box } = useMeasurer(rightPageRef);

  // Re-flow the stored text into pages that actually fit this page box.
  const display = useMemo(() => {
    const text = pages.map((p) => p.content).join('\n\n');
    if (!text) return [] as string[];
    if (!ready || box.height < 40) return pages.map((p) => p.content);

    return fitParagraphs(text.split(/\n\s*\n/), box.height, measure).map((g) => g.join('\n\n'));
  }, [pages, ready, box.height, measure]);

  const lastSpread = Math.max(0, Math.ceil(display.length / 2) - 1);
  const atEndOfWhatWeHave = spread >= lastSpread;

  // Pull the next window of pages as the reader approaches the end of what we hold.
  const fetching = useRef(false);
  useEffect(() => {
    if (fetching.current || blocked) return;

    const highest = pages.length ? pages[pages.length - 1].index : -1;
    if (highest >= book.pageCount - 1) return;
    if (lastSpread - spread > FETCH_AHEAD) return;

    fetching.current = true;
    const from = highest + 1;

    fetch(`/api/books/${book.slug}/pages?from=${from}&to=${from + WINDOW}`)
      .then(async (res) => {
        if (res.status === 402) {
          const json = await res.json().catch(() => ({}));
          setReason((json.reason as AccessReason) ?? 'PREVIEW_ONLY');
          setBlocked(true); // not an error: the reader reached the boundary
          return;
        }
        if (!res.ok) return;

        const json = await res.json();
        if (Array.isArray(json.pages) && json.pages.length) {
          setPages((prev) => {
            const seen = new Set(prev.map((p) => p.index));
            return [...prev, ...json.pages.filter((p: Page) => !seen.has(p.index))];
          });
        }
        if (json.canRead === false) {
          setReason(json.reason as AccessReason);
          setBlocked(true);
        }
      })
      .finally(() => {
        fetching.current = false;
      });
  }, [spread, lastSpread, pages, blocked, book.slug, book.pageCount]);

  // Save reading position, debounced, and only when there is somebody to save it for.
  useEffect(() => {
    if (!signedIn) return;
    const t = setTimeout(() => {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug: book.slug, pageIndex: spread * 2 }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [spread, signedIn, book.slug]);

  const showPaywallAt = blocked ? lastSpread + 1 : Infinity;

  const go = useCallback(
    (dir: 1 | -1) => {
      setSpread((current) => {
        const next = current + dir;
        if (next < 0) return current;
        if (next > Math.min(lastSpread + (blocked ? 1 : 0), lastSpread + 1)) return current;

        setTurn({ dir, from: current, to: next });
        setTimeout(() => setTurn(null), turnDuration());
        return next;
      });
    },
    [lastSpread, blocked],
  );

  const { bind } = useFlip({
    onNext: () => go(1),
    onPrev: () => go(-1),
    enabled: !turn,
  });

  const pageText = (i: number) => (i >= 0 && i < display.length ? display[i] : null);
  const leftIndex = spread * 2;
  const rightIndex = spread * 2 + 1;

  const paywall =
    blocked && spread === showPaywallAt ? (
      <Paywall
        reason={reason}
        book={book}
        trialEndsAt={trialEndsAt ? new Date(trialEndsAt) : null}
        pagesRead={display.length}
        signedIn={signedIn}
      />
    ) : null;

  const percent = book.pageCount ? Math.min(100, Math.round(((leftIndex + 1) / display.length) * 100)) : 0;

  return (
    <div
      className="reader"
      ref={bind}
      style={{ ['--read-frac' as string]: String(percent / 100) }}
    >
      <div className="reader__chrome">
        <Link className="reader__back" href={`/books/${book.slug}`}>
          ← {book.title}
        </Link>
        <span className="reader__pos">
          {display.length ? `Page ${leftIndex + 1}–${rightIndex + 1} of ${display.length}` : ''}
          {trialEndsAt && reason === 'TRIAL_ACTIVE' ? (
            <span className="reader__trial">
              {' · '}
              {Math.max(
                0,
                Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000),
              )}{' '}
              days left of your free week
            </span>
          ) : null}
        </span>
      </div>

      <div className="spread">
        <section className="page page--left">
          <header className="page__running">{book.title}</header>
          {paywall && spread === showPaywallAt ? (
            <div className="page__body">{paywall}</div>
          ) : (
            <PageBody text={pageText(leftIndex)} folio={pageText(leftIndex) ? leftIndex + 1 : null} />
          )}
        </section>

        <section className="page page--right" id="page-content" ref={rightPageRef}>
          <header className="page__running">{book.author}</header>
          {paywall && spread === showPaywallAt ? (
            <div className="page__body" />
          ) : (
            <PageBody text={pageText(rightIndex)} folio={pageText(rightIndex) ? rightIndex + 1 : null} />
          )}
        </section>

        <div className="spread__gutter" aria-hidden="true" />
      </div>

      {turn ? (
        <Leaf
          dir={turn.dir}
          front={<ReaderSpread display={display} spread={turn.from} book={book} />}
          back={<ReaderSpread display={display} spread={turn.to} book={book} />}
        />
      ) : null}
    </div>
  );
}

/** A static snapshot of one spread, used for the faces of a turning leaf. */
function ReaderSpread({
  display,
  spread,
  book,
}: {
  display: string[];
  spread: number;
  book: Book;
}) {
  const at = (i: number) => (i >= 0 && i < display.length ? display[i] : null);
  const l = spread * 2;
  const r = spread * 2 + 1;

  return (
    <div className="spread">
      <section className="page page--left">
        <header className="page__running">{book.title}</header>
        <PageBody text={at(l)} folio={at(l) ? l + 1 : null} />
      </section>
      <section className="page page--right">
        <header className="page__running">{book.author}</header>
        <PageBody text={at(r)} folio={at(r) ? r + 1 : null} />
      </section>
    </div>
  );
}
