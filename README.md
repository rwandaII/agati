# Agati Library

A digital reading platform for [Agati Library](https://www.agatilibrary.org/), the Rwandan NGO that
has grown from one Musanze room with 200 books in April 2018 to eight library spaces across Musanze,
Rubavu, Kicukiro, Nyamasheke and Karongi.

The whole site is presented as a physical book: a hardcover that opens, paper spreads that turn when
you scroll, and books you read a page at a time. That is not decoration — Agati's own logo is an open
book whose pages branch into a tree (*agati* means "tree" in Kinyarwanda).

---

## Getting started

You need **Node 24+**. Nothing else — no database server, no Docker.

```bash
npm install
cp .env.example .env          # then put a real SESSION_SECRET in it
npm run db:push               # creates dev.db
npm run fetch:books           # downloads the public-domain books (a few minutes)
npm run db:seed               # loads books, news and the admin account
npm run dev                   # http://localhost:3000
```

Generate a real session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**The seeded admin is `admin@agatilibrary.org` / `changeme123`. Change that password before this
goes anywhere near the internet.**

---

## Money

**Payments run in mock mode until you add Flutterwave keys.** The whole flow works — phone number,
"approve on your phone", pending, success, book unlocks — but no real money moves. See
[`docs/PAYMENTS.md`](docs/PAYMENTS.md) to switch it on.

Prices live in one file, `src/config/pricing.ts`:

| | USD | RWF |
|---|---|---|
| A year | $10 | 13,000 |
| A month | $1 | 1,300 |

`USD_TO_RWF` is a single constant there — update it when the rate moves. RWF is the currency actually
charged, and it is a zero-decimal currency, so every amount in the codebase is a whole number.

Individual books are priced in RWF on the book record.

---

## How access works

Everything resolves through one pure function, `resolveAccess` in `src/lib/access/resolve.ts`.
First match wins:

1. **Admin** — reads anything
2. **Active subscription** — reads everything
3. **Bought this book** — reads this book
4. **Free forever** — anyone reads it, no account needed
5. **Inside the 7-day window** — reads it, and sees how long is left
6. **Window expired** — preview only, with a paywall
7. **Otherwise** — preview only

The seven-day clock starts when a signed-in reader *first opens that book*, not when it was
published. Someone who finds a book six months from now still gets their full week.

Page text beyond the preview never reaches the browser without passing this check. The ceiling is
applied inside the database query, so unearned text is not even loaded into memory. Hiding things
with CSS is not access control.

---

## Adding books

**A few at a time:** sign in as the admin and POST to `/api/admin/books` with the book's details and
its full text in a `text` field. It is paginated automatically.

**In bulk:** add an entry to `WANTED` in `scripts/fetch-books.ts`, then:

```bash
npm run fetch:books && npm run db:seed
```

The fetcher resolves titles through the Gutendex API rather than hard-coded Gutenberg IDs, scores
candidates on how much of the title they actually match (so "The Wind in the Willows" cannot quietly
become a different book), strips the licence boilerplate, and writes committed JSON. Production never
calls an external service.

**Changing how a title earns:** PATCH it with a new `accessType` and `priceRwf`. The three types are
`FREE_FOREVER`, `FREE_TRIAL` and `PAID`.

Public-domain titles are seeded `FREE_FOREVER`. They may lawfully be sold, but an NGO charging for
Aesop reads badly — the paid titles are Agati's own original works.

---

## Where things live

| Path | What |
|---|---|
| `src/config/brand.ts`, `src/app/theme.css` | Colours, fonts, contact details — change the brand here and nowhere else |
| `src/config/pricing.ts` | Prices and the exchange rate |
| `src/config/site.ts` | The book's page order |
| `src/components/book/` | The cover, the spread, the turning leaf, the flip engine |
| `src/components/reader/` | The reader, its paginator and the paywall |
| `src/lib/access/` | The entitlement rule |
| `src/lib/payments/` | The provider interface, Flutterwave, and the mock |
| `src/content/` | Book text, Agati originals, news posts |

---

## Testing

```bash
npm test
```

The suite concentrates where a defect costs money or leaks a paid book: the access rule, the webhook
signature, price conversion, pagination, and the gated pages endpoint.

---

## Notes for Agati

- **The Kinyarwanda book** (`src/content/originals/ubwenge.ts`) should be reviewed by a first-language
  speaker before it is sold. It is written in deliberately plain Kinyarwanda with English alongside.
- **The interface is in English**; the books are English, French and Kinyarwanda. The database already
  stores a language per book, so a trilingual interface is addable later.
- **Subscriptions do not auto-renew.** They expire and are bought again. Nothing is taken from a
  reader without asking.
