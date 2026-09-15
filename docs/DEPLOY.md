# Deploying

## Database

Postgres. There's no local file database in production: accounts, shelves, bookmarks and purchases
all need somewhere the running site can actually write to.

This matters on Vercel specifically, because the filesystem there is read-only and thrown away
between requests. A SQLite file wouldn't survive, and it isn't in the repo anyway.

Any Postgres will do. [Neon](https://neon.tech) and
[Vercel Postgres](https://vercel.com/storage/postgres) both have free tiers and give you a
connection string straight away.

## Vercel

1. Create the database and copy the connection string. Take the **pooled** one if you get a choice,
   serverless functions open a lot of short lived connections.

   Add `?sslmode=require&pgbouncer=true` to the pooled string. A pooler in transaction mode gives
   the next query a different backend connection, so Prisma's per-connection prepared statement
   cache stops making sense. `pgbouncer=true` turns that caching off. If you forget it the site
   works fine for a while and then starts throwing
   `prepared statement "s0" already exists`, which took me an embarrassing amount of time to track
   down.

2. Environment variables, under Settings > Environment Variables. Set them for Production, Preview
   and Development. `DATABASE_URL` is read at build time too, so leaving it off Preview breaks
   preview deploys:

   ```
   DATABASE_URL   postgresql://...
   SESSION_SECRET <32+ random bytes, new ones for production>
   APP_URL        https://your-domain.example
   ```

   Flutterwave keys as well if real money is meant to move, see `docs/PAYMENTS.md`.

3. Create the tables and fill them once, from your own machine, pointed at the new database:

   ```bash
   DATABASE_URL="postgresql://..." npm run fetch:books   # first time only
   DATABASE_URL="postgresql://..." npm run db:setup      # tables, then books, news, admin
   ```

   Use the direct (unpooled) string for this if the provider gives you one. Schema changes through a
   pooler are unreliable.

4. Settings > Functions, set the region. Default is Washington DC, which puts an Atlantic crossing
   in front of every query for a site meant to be read from Kigali. Pick whatever region the
   database is in. Frankfurt (`fra1`) is usually the closest available. This is worth more than any
   query tuning.

5. Deploy. Vercel runs `npm install` (which regenerates the Prisma client via `postinstall`) and
   then `npm run build`. No `vercel.json` needed.

The build doesn't need the database to be up. I checked this rather than assuming it: `npm run
build` with `DATABASE_URL` pointing at a closed port still completes all 28 routes. The news pages
fall back to on-demand rendering and the sitemap is generated per request.

`.vercelignore` keeps `src/content/books` out of the upload. It's ~12MB of seed text that only
`prisma/seed.ts` ever reads, on whatever machine runs the seed. The deployed site reads books from
Postgres.

## Environment

```
DATABASE_URL="postgresql://..."
SESSION_SECRET="<32+ random bytes>"
APP_URL="https://your-domain.example"
FLW_ENV="production"
FLW_CLIENT_ID="..."
FLW_CLIENT_SECRET="..."
FLW_SECRET_HASH="..."
```

Session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use a different one from development. Changing it signs everybody out, which is what you want if it
ever leaks.

`APP_URL` is used by the sitemap, the OG images and the webhook instructions, so it has to be right.

## Build

```bash
npm run build
npm start
```

`npm run build` runs `prisma generate` first, so a stale client can't get deployed.

## Before going live

- [ ] `npm test` passes (needs a `DATABASE_URL`, point it at a scratch db, not production)
- [ ] `npm run build` succeeds
- [ ] `DATABASE_URL`, `SESSION_SECRET`, `APP_URL` set on Vercel for Production and Preview
- [ ] admin password is not `changeme123` any more
- [ ] `SESSION_SECRET` is a fresh one, not the dev value
- [ ] `APP_URL` is the real domain
- [ ] one sandbox purchase completed end to end (`docs/PAYMENTS.md`)
- [ ] webhook points at `https://<domain>/api/webhooks/flutterwave`
- [ ] `/sitemap.xml` and `/robots.txt` look right
- [ ] view-source on a paid book's reader page shows no text past the preview
