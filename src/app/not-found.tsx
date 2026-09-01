import Link from 'next/link';
import { Spread } from '@/components/book/Spread';
import { PageTitle, Lead } from '@/components/ui/Prose';

export default function NotFound() {
  return (
    <Spread
      running="Agati Library"
      folio={0}
      left={
        <>
          <PageTitle kicker="404">This page was torn out</PageTitle>
          <Lead>
            Whatever was here is not here now. It may have been moved, or it may never have existed
            at all.
          </Lead>
        </>
      }
      right={
        <p className="home__actions">
          <Link href="/">Back to the beginning →</Link>
          <Link href="/library">Open the collection →</Link>
          <Link href="/search">Search for it →</Link>
        </p>
      }
    />
  );
}
