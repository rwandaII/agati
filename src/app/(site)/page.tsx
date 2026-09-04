import Link from 'next/link';
import Image from 'next/image';
import { Spread } from '@/components/book/Spread';
import { CoverGate } from '@/components/book/CoverGate';
import { PageTitle, Lead, Rule, Scroller } from '@/components/ui/Prose';
import { AgatiWord } from '@/components/ui/AgatiWord';
import { Plate } from '@/components/ui/PhotoStrip';
import { SocialLinks } from '@/components/ui/SocialLinks';
import { SITE } from '@/config/brand';
import { HERO, MARK_COLOUR } from '@/config/photos';

export default function Home() {
  return (
    <>
      <Spread
        running="Agati Library"
        folio={2}
        left={
          <Scroller>
            <Image
              className="home__mark"
              src={MARK_COLOUR}
              alt=""
              aria-hidden="true"
              width={130}
              height={134}
              priority
            />

            <PageTitle kicker={SITE.tagline}>
              <AgatiWord /> Library
            </PageTitle>

            <Lead>{SITE.mission}</Lead>

            <p>
              <em>Agati</em> means a tree. We started with fewer than two hundred books in one room
              in Musanze, in April 2018.
            </p>

            <p className="home__actions">
              <Link href="/library">Open the collection →</Link>
              <Link href="/about">How Agati began →</Link>
              <a href={SITE.donateUrl} target="_blank" rel="noreferrer noopener">
                Support the libraries →
              </a>
            </p>
          </Scroller>
        }
        right={
          <Scroller>
            <p className="home__stat">
              <strong>8</strong> library spaces
              <span>Musanze · Rubavu · Kicukiro · Nyamasheke · Karongi</span>
            </p>
            <p className="home__stat">
              <strong>32</strong> books to read here
              <span>English · Français · Kinyarwanda</span>
            </p>

            <Rule />

            <Plate photo={HERO} wide caption="An Agati library, in use" />

            <p>
              Everything on these shelves can be read here, a page at a time. Many books are free
              forever. Others are yours free for a week.
            </p>

            <SocialLinks />
          </Scroller>
        }
      />
      <CoverGate />
    </>
  );
}
