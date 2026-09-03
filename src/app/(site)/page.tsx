import Link from 'next/link';
import Image from 'next/image';
import { AgatiWord } from '@/components/ui/AgatiWord';
import { SITE, LOGO_SEQUENCE } from '@/config/brand';
import { HERO } from '@/config/photos';
import { listBooks } from '@/lib/books';
import { listNews, formatNewsDate } from '@/lib/news';
import { BookCard } from '@/components/library/BookCard';

const PROGRAMS = [
  ['Agati Mobile Library', 'A crate of books carried out along the ridge roads, to communities with no library at all.'],
  ['Nge Nawe Dusome', 'Children read their favourite books — and their own stories — on the radio.'],
  ['Writers Residency', 'A sanctuary where new narratives are born and manuscripts are finished.'],
  ['Hospital Libraries', 'A safe, creative space for children spending their year in a ward.'],
] as const;

export default async function Home() {
  const [featured, news] = await Promise.all([listBooks({}), listNews(3)]);
  const shelf = featured.filter((b) => b.featured).slice(0, 4);

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="wrap">
        <div className="hero">
          <div>
            <p className="eyebrow">{SITE.tagline}</p>
            <h1 className="h1">
              <AgatiWord /> Library
            </h1>
            <p className="lead">{SITE.mission}</p>

            <div className="stats">
              <span className="stat">
                <strong>8</strong>
                <span>library spaces</span>
              </span>
              <span className="stat">
                <strong>32</strong>
                <span>books to read here</span>
              </span>
              <span className="stat">
                <strong>3</strong>
                <span>languages</span>
              </span>
            </div>

            <div className="buttons">
              <Link className="button button--primary" href="/library">
                Open the collection
              </Link>
              <a
                className="button button--gold"
                href={SITE.donateUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Support a library
              </a>
            </div>
          </div>

          <figure className="hero__art">
            <Image src={HERO.src} alt={HERO.alt} width={1103} height={735} priority sizes="(max-width: 900px) 92vw, 46vw" />
          </figure>
        </div>
      </section>

      {/* ---------- start reading ---------- */}
      <section className="section section--tint">
        <div className="wrap">
          <p className="eyebrow">Start reading</p>
          <h2 className="h2">Open a book right now</h2>
          <p className="lead">
            Every book here can be read on this site, a page at a time, like a real book. Many are
            free forever.
          </p>

          <div className="shelf">
            {shelf.map((b) => (
              <BookCard key={b.slug} book={b} />
            ))}
          </div>

          <div className="buttons">
            <Link className="button button--ghost" href="/library">
              See all 32 books
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- what Agati does ---------- */}
      <section className="section">
        <div className="wrap">
          <p className="eyebrow">What we do</p>
          <h2 className="h2">A library is not only a room</h2>

          <div className="cards">
            {PROGRAMS.map(([name, body], i) => (
              <article
                key={name}
                className="card"
                style={{ ['--card' as string]: LOGO_SEQUENCE[i % LOGO_SEQUENCE.length] }}
              >
                <h3 className="h3">{name}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>

          <div className="buttons">
            <Link className="button button--ghost" href="/programs">
              All nine programmes
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- news ---------- */}
      <section className="section section--tint">
        <div className="wrap">
          <p className="eyebrow">What we have done</p>
          <h2 className="h2">Lately at Agati</h2>

          <div className="cards">
            {news.map((n, i) => (
              <article
                key={n.slug}
                className="card"
                style={{ ['--card' as string]: LOGO_SEQUENCE[(i + 3) % LOGO_SEQUENCE.length] }}
              >
                <p className="news__meta">
                  {formatNewsDate(n.publishedAt)} · {n.category}
                </p>
                <h3 className="h3">
                  <Link href={`/news/${n.slug}`}>{n.title}</Link>
                </h3>
                <p>{n.excerpt}</p>
              </article>
            ))}
          </div>

          <div className="buttons">
            <Link className="button button--ghost" href="/news">
              Read the news
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
