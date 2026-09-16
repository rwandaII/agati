'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Leaf } from '@/components/book/Leaf';
import { useFlip } from '@/components/book/useFlip';
import { turnDuration } from '@/components/book/constants';
import { fitParagraphs } from '@/lib/reader/paginate';
import { useMeasurer } from './useMeasurer';
import { Paywall } from './Paywall';
import { ComicPage } from './ComicPage';
import { PagePosition } from './PagePosition';
import { useStageValue } from '@/components/book/Stage';
import { displayLines } from './lines';
import { Bookmarks, type Mark } from './Bookmarks';
import { PenMark } from './PenMark';
import { ResumeNotice } from './ResumeNotice';
import { useReadingPlace, localAnchor } from './useReadingPlace';
import { anchorOfPage, pageAtAnchor, weigh } from '@/lib/reading/anchor';
import { charsBefore, wordsAt } from './pointing';

import type { AccessReason } from '@/lib/access/resolve';

type Page = { index: number; content: string; image?: string | null };

type Book = {
  slug: string;
  title: string;
  author: string;
  priceRwf: number;
  accessType: 'FREE_FOREVER' | 'FREE_TRIAL' | 'PAID';
  pageCount: number;
  format?: 'TEXT' | 'COMIC';
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
          <p key={i}>
            {/* Verse and contents keep their breaks; wrapped prose does not. */}
            {displayLines(p).map((line, j, all) => (
              <span key={j}>
                {line}
                {j < all.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
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
  startAnchor,
  bookmarks: initialBookmarks,
  signedIn,
}: {
  book: Book;
  pages: Page[];
  canRead: boolean;
  reason: AccessReason;
  previewPages: number;
  trialEndsAt: string | null;
  startAnchor: number;
  bookmarks: Mark[];
  signedIn: boolean;
}) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [reason, setReason] = useState<AccessReason>(initialReason);
  const [blocked, setBlocked] = useState(!canRead);
  // always opens at the beginning. The saved place moves it once it's known and
  // the text has been laid out for this screen.
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState<{ dir: 1 | -1; from: number; to: number } | null>(null);
  const [marks, setMarks] = useState<Mark[]>(initialBookmarks);
  const [penHint, setPenHint] = useState<string | null>(null);
  const [penMode, setPenMode] = useState(false);

  const rightPageRef = useRef<HTMLElement | null>(null);
  const leftPageRef = useRef<HTMLElement | null>(null);
  const { measure, ready, box } = useMeasurer(rightPageRef);

  /** The box the book is played on: how many pages are open, and which way up. */
  const { leaves, turned } = useStageValue();

  const isComic = book.format === 'COMIC';

  /** The book as it is stored, whose page numbering never changes. */
  const storedText = useMemo(() => pages.map((p) => p.content), [pages]);

  /** For a comic the plates ARE the pages, in order, never re-flowed. */
  const plates = useMemo(
    () => (isComic ? pages.map((p) => p.image ?? null) : []),
    [isComic, pages],
  );

  // reflow the stored text into pages that actually fit this page box
  const display = useMemo(() => {
    if (isComic) return plates.map((_, i) => String(i));
    const text = pages.map((p) => p.content).join('\n\n');
    if (!text) return [] as string[];
    if (!ready || box.height < 40) return pages.map((p) => p.content);

    return fitParagraphs(text.split(/\n\s*\n/), box.height, measure).map((g) => g.join('\n\n'));
  }, [pages, ready, box.height, measure, isComic, plates]);

  const lastSpread = Math.max(0, Math.ceil(display.length / leaves) - 1);
  const atEndOfWhatWeHave = spread >= lastSpread;

  const ceiling = lastSpread + (blocked ? 1 : 0);
  useEffect(() => {
    setSpread((current) => (current > ceiling ? ceiling : current));
  }, [ceiling]);

  // pull the next window of pages as the reader gets near the end of what we hold
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

  // Discourage casual copying of book text. Honest limits: this stops
  // select-and-copy, right click and the shortcuts, but anyone with devtools
  // can still read the DOM. The real protection is the server gate, which never
  // sends unearned pages at all.
  useEffect(() => {
    const swallow = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.('.page__body')) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (['c', 'x', 'a', 's', 'p'].includes(e.key.toLowerCase())) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
      }
    };

    document.addEventListener('copy', swallow);
    document.addEventListener('cut', swallow);
    document.addEventListener('contextmenu', swallow);
    document.addEventListener('dragstart', swallow);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('copy', swallow);
      document.removeEventListener('cut', swallow);
      document.removeEventListener('contextmenu', swallow);
      document.removeEventListener('dragstart', swallow);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // cursor becomes the pen, so it's obvious the next touch will mark
  useEffect(() => {
    document.body.classList.toggle('is-penned', penMode);
    return () => document.body.classList.remove('is-penned');
  }, [penMode]);

  // a reader who hasn't signed in still gets their place back on this device,
  // but it has to be read from the browser, so it isn't known on first render
  const [guestAnchor, setGuestAnchor] = useState(0);
  const [anchorKnown, setAnchorKnown] = useState(signedIn);
  useEffect(() => {
    if (signedIn) return;
    setGuestAnchor(localAnchor(book.slug));
    setAnchorKnown(true);
  }, [signedIn, book.slug]);

  const { resumedAt, dismissResume, anchorNow, startOver } = useReadingPlace({
    slug: book.slug,
    signedIn,
    isComic,
    display,
    pageCount: book.pageCount,
    loadedPages: pages.length,
    storedText: storedText,
    spread,
    setSpread,
    startAnchor: signedIn ? startAnchor : guestAnchor,
    known: anchorKnown,
    laidOut: isComic || ready,
    leaves,
  });

  // --- the pen ---

  /** A word to the reader about what just happened, then out of the way. */
  const say = useCallback((message: string) => {
    setPenHint(message);
    setTimeout(() => setPenHint((current) => (current === message ? null : current)), 3200);
  }, []);

  /**
   * Mark the line a reader pointed at.
   *
   * The click resolves down to the character it landed on, so the mark belongs
   * to that line and finds it again however the book is laid out next time. A
   * comic has no text to point into, so a plate is marked whole.
   */
  const markAt = useCallback(
    async (pageIndexOnScreen: number, page: HTMLElement, x: number, y: number) => {
      if (!signedIn) {
        say('Sign in to keep your marks.');
        setPenMode(false);
        return;
      }

      let anchor: number;
      let label: string;

      if (isComic) {
        anchor = pageIndexOnScreen;
        label = `Plate ${pageIndexOnScreen + 1}`;
      } else {
        const body = page.querySelector('.page__body');
        if (!body) return;
        anchor = anchorOfPage(display, pageIndexOnScreen) + charsBefore(body, x, y);
        label = wordsAt(body, x, y) || `Page ${pageIndexOnScreen + 1}`;
      }

      setPenMode(false);

      // show it immediately, a mark that waits for the network feels broken
      const optimistic: Mark = { id: `pending-${anchor}`, anchor, label };
      setMarks((current) => [...current, optimistic].sort((a, b) => a.anchor - b.anchor));

      try {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ slug: book.slug, anchor, label }),
        });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? 'Could not save that mark');

        setMarks((current) =>
          current
            .map((m) => (m.id === optimistic.id ? json.bookmark : m))
            .sort((a, b) => a.anchor - b.anchor),
        );
        say('Marked.');
      } catch (err) {
        setMarks((current) => current.filter((m) => m.id !== optimistic.id));
        say(err instanceof Error ? err.message : 'Could not save that mark');
      }
    },
    [signedIn, isComic, display, book.slug, say],
  );

  const removeMark = useCallback(
    async (id: string) => {
      const kept = marks;
      setMarks((current) => current.filter((m) => m.id !== id));
      try {
        const res = await fetch(`/api/bookmarks?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        say('Mark removed.');
      } catch {
        setMarks(kept);
        say('Could not remove that mark');
      }
    },
    [marks, say],
  );

  const goToMark = useCallback(
    (anchor: number) => {
      const page = isComic ? anchor : pageAtAnchor(display, anchor);
      setSpread(Math.floor(page / 2));
    },
    [display, isComic],
  );

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
    turned,
  });

  /**
   * Touching the page turns it: right page forward, left page back. That's how
   * a book has always worked and it leaves the paper uncluttered. A click meant
   * for a link, a button or the pen is never taken as a page turn.
   */
  const touchPage = useCallback(
    (which: 'left' | 'right', pageOnScreen: number) => (e: React.MouseEvent<HTMLElement>) => {
      const el = e.target as HTMLElement;
      if (el.closest('a, button, input, select, textarea, [role="button"]')) return;

      if (penMode) {
        markAt(pageOnScreen, e.currentTarget, e.clientX, e.clientY);
        return;
      }

      if (window.getSelection()?.toString()) return;

      // with a spread open, which page you touched says which way to go. With
      // one page there's no other page to touch, so the near edge goes back.
      if (leaves === 1) {
        const page = e.currentTarget.getBoundingClientRect();
        const backwards = e.clientX - page.left < page.width * 0.25;
        go(backwards ? -1 : 1);
        return;
      }

      go(which === 'right' ? 1 : -1);
    },
    [penMode, markAt, go, leaves],
  );

  /** The marks that fall on one of the two pages now showing. */
  const marksOn = useCallback(
    (pageOnScreen: number) => {
      if (isComic) return marks.filter((m) => m.anchor === pageOnScreen);
      const from = anchorOfPage(display, pageOnScreen);
      const to = from + weigh(display[pageOnScreen] ?? '');
      return marks.filter((m) => m.anchor >= from && m.anchor < to);
    },
    [marks, isComic, display],
  );

  const pageText = (i: number) => (i >= 0 && i < display.length ? display[i] : null);
  const leftIndex = spread * leaves;
  const rightIndex = leftIndex + 1;

  /** The pages actually open: both halves of a spread, or the single leaf. */
  const openPages: Array<{ index: number; side: "left" | "right" }> =
    leaves === 2
      ? [
          { index: leftIndex, side: "left" },
          { index: rightIndex, side: "right" },
        ]
      : [{ index: leftIndex, side: "right" }];

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
          {display.length
            ? leaves === 2
              ? `Page ${leftIndex + 1}-${rightIndex + 1} of ${display.length}`
              : `Page ${leftIndex + 1} of ${display.length}`
            : ''}
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

      <div className={`spread ${leaves === 1 ? 'spread--single' : ''}`}>
        {openPages.map(({ index, side }) => {
          const ref = side === 'left' ? leftPageRef : rightPageRef;
          const showPaywall = paywall && spread === showPaywallAt;

          return (
            <section
              key={side}
              className={`page page--${side}`}
              // the measurer sizes the text column from whichever page is being
              // laid out, so that id follows the right-hand page
              id={side === 'right' ? 'page-content' : undefined}
              ref={ref}
              onClick={touchPage(side, index)}
            >
              <header className="page__running">{side === 'left' ? book.title : book.author}</header>

              {marksOn(index).map((m) => (
                <PenMark
                  key={m.id}
                  pageRef={ref}
                  charsIn={isComic ? 0 : m.anchor - anchorOfPage(display, index)}
                  label={m.label}
                  turned={turned}
                  deps={display}
                />
              ))}

              {showPaywall ? (
                side === 'left' || leaves === 1 ? (
                  <div className="page__body">{paywall}</div>
                ) : (
                  <div className="page__body" />
                )
              ) : isComic ? (
                <ComicPage
                  src={plates[index] ?? null}
                  folio={plates[index] ? index + 1 : null}
                  alt={`${book.title}, page ${index + 1}`}
                />
              ) : (
                <PageBody text={pageText(index)} folio={pageText(index) ? index + 1 : null} />
              )}
            </section>
          );
        })}

        <div className="spread__gutter" aria-hidden="true" />
      </div>

      <PagePosition
        position={
          display.length
            ? leaves === 2
              ? `Page ${leftIndex + 1}-${Math.min(rightIndex + 1, display.length)} of ${display.length}`
              : `Page ${leftIndex + 1} of ${display.length}`
            : ''
        }
      />

      <Bookmarks
        marks={marks}
        penMode={penMode}
        onTogglePen={() => setPenMode((v) => !v)}
        onRemove={removeMark}
        onGo={goToMark}
        disabled={!display.length || !signedIn}
        hint={penHint}
      />

      {resumedAt !== null && resumedAt > 1 ? (
        <ResumeNotice page={leftIndex + 1} onStartOver={startOver} onDismiss={dismissResume} />
      ) : null}

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
