import Link from 'next/link';
import { Spread } from '@/components/book/Spread';
import { CoverGate } from '@/components/book/CoverGate';
import { PageTitle, Lead, Rule } from '@/components/ui/Prose';
import { SITE } from '@/config/brand';

export default function Home() {
  return (
    <>
      <Spread
        running="Agati Library"
        folio={2}
        left={
          <>
            <span className="home__mark" aria-hidden="true" />
            <PageTitle kicker={SITE.tagline}>Agati Library</PageTitle>
            <Lead>{SITE.mission}</Lead>
            <p>
              <em>Agati</em> means a tree. We started with fewer than two hundred books in one room
              in Musanze, in April 2018.
            </p>
          </>
        }
        right={
          <>
            <p className="home__stat">
              <strong>8</strong> library spaces
              <span>Musanze · Rubavu · Kicukiro · Nyamasheke · Karongi</span>
            </p>
            <p className="home__stat">
              <strong>Thousands</strong> of books
              <span>English · Français · Kinyarwanda</span>
            </p>
            <Rule />
            <p>
              Everything on these shelves can be read here, on this page, one page at a time. Many
              books are free forever. Others are free for a week, and then ask you to keep them.
            </p>
            <p className="home__actions">
              <Link href="/library">Open the collection →</Link>
              <Link href="/about">How Agati began →</Link>
              <a href={SITE.donateUrl} target="_blank" rel="noreferrer noopener">
                Support the libraries →
              </a>
            </p>
          </>
        }
      />
      <CoverGate />
    </>
  );
}
