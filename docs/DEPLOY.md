# Deploying

## The database

The site runs on **PostgreSQL**. There is no local database file: the reader accounts, the shelf,
the bookmarks and every purchase live in a real database that the running site can write to.

That matters most on a serverless host like Vercel, where the filesystem is read-only and thrown
away between requests. A SQLite file there cannot be written to, is not carried in the repository,
and is not the same file twice — so it is not an option, not a slower one.

Any Postgres works. [Neon](https://neon.tech) and [Vercel Postgres](https://vercel.com/storage/postgres)
both have a free tier and hand you a connection string directly.

## Deploying to Vercel

1. **Create the database** and copy its connection string — the *pooled* one, if you are offered a
   choice. Serverless functions open a lot of short-lived connections.

   Put `?sslmode=require&pgbouncer=true` on the end of that pooled string. A pooler in transaction
   mode hands the next query a different backend connection than the last one, so the prepared
   statements Prisma caches per connection stop existing under it — `pgbouncer=true` is how Prisma
   is told to stop caching them. Without it the site works until it suddenly does not, with
   `prepared statement "s0" already exists`.

2. **Set the environment variables** in Vercel, under Settings → Environment Variables, for
   Production, Preview and Development alike. `DATABASE_URL` is needed at build time as well as at
   run time, so leaving it off Preview breaks preview deploys:

   ```
   DATABASE_URL   postgresql://...
   SESSION_SECRET <32+ random bytes, generated fresh for production>
   APP_URL        https://your-domain.example
   ```

   Add the Flutterwave keys too if real money is meant to move — see `docs/PAYMENTS.md`.

3. **Create the tables and fill them**, once, from your own machine, pointing at the new database:

   ```bash
   DATABASE_URL="postgresql://..." npm run fetch:books   # first time only, a few minutes
   DATABASE_URL="postgresql://..." npm run db:setup      # tables, then books, news, admin
   ```

   Use the *direct* (unpooled) connection string for this if your provider offers one; schema
   changes do not go through a connection pooler reliably.

4. **Set the function region** under Settings → Functions. The default is Washington, D.C., which
   puts a hop across the Atlantic in front of every database read for a library meant to be read
   from Kigali. Pick the region the database is in — Frankfurt (`fra1`) is the closest of the
   usual choices. Region matters more than any query you could tune.

5. **Deploy.** Vercel runs `npm install` — which regenerates the Prisma client through the
   `postinstall` script — and then `npm run build`. Nothing else needs configuring; there is no
   `vercel.json`.

The build itself never depends on the database being reachable, and that is checked rather than
hoped for: `npm run build` against a connection string pointing at nothing still finishes, because
the news pages that would be built ahead of time fall back to rendering on demand and
`/sitemap.xml` is generated per request. A database that is briefly down delays content, not the
deploy.

What is *not* uploaded is listed in `.vercelignore`: the book text under `src/content/books` is
seed material, read once by `prisma/seed.ts` on the machine that fills the database. The running
site reads books out of Postgres and never opens those files.

## Environment

```
DATABASE_URL="postgresql://..."
SESSION_SECRET="<32+ random bytes, generated fresh for production>"
APP_URL="https://your-domain.example"
FLW_ENV="production"
FLW_CLIENT_ID="..."
FLW_CLIENT_SECRET="..."
FLW_SECRET_HASH="..."
```

Generate the session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use a different secret from development. Changing it signs everyone out, which is the correct
behaviour if it is ever exposed.

`APP_URL` matters: it is used for the sitemap, for Open Graph images, and in the webhook instructions.

## Build

```bash
npm run build
npm start
```

`npm run build` runs `prisma generate` before `next build`, so a client generated against an older
schema can never be what gets deployed.

## Checklist before opening the doors

- [ ] `npm test` passes (it needs a `DATABASE_URL` — point it at a scratch database, not production)
- [ ] `npm run build` succeeds
- [ ] `DATABASE_URL`, `SESSION_SECRET` and `APP_URL` are set on Vercel for Production *and* Preview
- [ ] The admin password is no longer `changeme123`
- [ ] `SESSION_SECRET` is fresh and not the development one
- [ ] `APP_URL` is the real domain
- [ ] A sandbox purchase completed end to end (see `docs/PAYMENTS.md`)
- [ ] The Flutterwave webhook points at `https://<domain>/api/webhooks/flutterwave`
- [ ] `/sitemap.xml` and `/robots.txt` return sensible content
- [ ] `view-source:` on a paid book's reader page shows no page text beyond the preview
