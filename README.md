# Agati Library

Live at **https://agati-library.vercel.app**

Online reading platform for [Agati Library](https://www.agatilibrary.org/), a Rwandan NGO that
started with one room and 200 books in Musanze (April 2018) and now runs eight library spaces in
Musanze, Rubavu, Kicukiro, Nyamasheke and Karongi.

The site is laid out like a physical book. The cover opens, spreads turn when you scroll, and books
are read a page at a time. The idea came from their logo, which is an open book whose pages branch
into a tree (*agati* is Kinyarwanda for "tree").

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind v4 + Prisma/Postgres.

## Running it locally

Needs Node 22+ and Docker.

```bash
npm install
cp .env.example .env          # put a real SESSION_SECRET in it
docker compose up -d          # postgres on localhost:5434
npm run db:push
npm run fetch:books           # downloads the public domain texts, takes a few minutes
npm run db:seed
npm run dev
```

Port 5434 instead of 5432 because 5432 was already taken on my machine by another project. If you
already have Postgres somewhere (or a free Neon database), just point `DATABASE_URL` at it and skip
the compose step.

`docker compose down` stops it, `-v` also wipes the data.

For the session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The seed creates an admin: `admin@agatilibrary.org` / `changeme123`. Change it before deploying
anywhere public.

## Payments

Runs in mock mode unless Flutterwave keys are present in `.env`. The whole flow still works (phone
number, approve-on-your-phone screen, pending, success, book unlocks), it just doesn't move money.
`docs/PAYMENTS.md` has the setup steps.

Prices are in `src/config/pricing.ts`:

| | USD | RWF |
|---|---|---|
| Year | $10 | 13,000 |
| Month | $1 | 1,300 |

`USD_TO_RWF` is a constant in that file, bump it when the rate moves. Everything is charged in RWF.
RWF has no decimals so all amounts are integers, don't introduce floats here.

Individual books get their price from the book row in the database.

## Access rules

All of it goes through `resolveAccess` in `src/lib/access/resolve.ts`. It's a pure function, first
match wins:

1. Admin: everything
2. Active subscription: everything
3. Bought the book: that book
4. `FREE_FOREVER`: anyone, no account needed
5. Inside the 7 day window: allowed, and we show the days left
6. Window expired: preview + paywall
7. Anything else: preview

The 7 days start when a signed-in reader opens the book for the first time, not from the publish
date, so someone finding a book late still gets a full week.

The page limit is applied in the Prisma query, not in the component, so text the reader hasn't paid
for is never loaded or serialised. Don't "hide" pages with CSS.

## Adding books

One or two at a time: sign in as admin and POST to `/api/admin/books` with the metadata and the full
text in `text`. It gets paginated server side.

In bulk: add an entry to `WANTED` in `scripts/fetch-books.ts`, then

```bash
npm run fetch:books && npm run db:seed
```

The fetcher goes through the Gutendex API instead of hardcoded Gutenberg ids, and scores candidates
on title overlap so "The Wind in the Willows" can't silently come back as something else. It strips
the licence boilerplate and writes JSON that gets committed. Nothing calls Gutendex at runtime.

To change how a title earns, PATCH it with a new `accessType` / `priceRwf`. Types are
`FREE_FOREVER`, `FREE_TRIAL`, `PAID`.

Public domain titles are seeded as `FREE_FOREVER`. Legally they could be sold, but an NGO charging
for Aesop looks bad. The paid titles are Agati's own work.

## Layout

| Path | What's in it |
|---|---|
| `src/config/brand.ts`, `src/app/theme.css` | colours, fonts, contact details |
| `src/config/pricing.ts` | prices, exchange rate |
| `src/config/site.ts` | page order of the book |
| `src/components/book/` | cover, spread, leaf, flip engine |
| `src/components/reader/` | reader, paginator, paywall |
| `src/lib/access/` | entitlement rule |
| `src/lib/payments/` | provider interface, Flutterwave, mock |
| `src/content/` | book text, Agati originals, news |

Brand colours only live in `brand.ts` and `theme.css`. Don't hardcode hex anywhere else, it gets
impossible to retheme.

## Tests

```bash
npm test
```

Coverage is deliberately uneven. The tests are concentrated where a bug costs money or leaks a paid
book: access rule, webhook signature, price conversion, pagination, the pages endpoint. UI
components are mostly not tested.

## Notes / still to do

- `src/content/originals/ubwenge.ts` is in Kinyarwanda and needs a first-language speaker to read it
  through before it goes on sale. It's written in deliberately simple Kinyarwanda with English
  alongside.
- UI is English only for now. Books are English, French and Kinyarwanda, and the language is already
  stored per book, so a translated interface is possible later.
- Subscriptions don't auto-renew. They expire and get bought again. This was on purpose.
