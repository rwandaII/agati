# Deploying

## Moving to PostgreSQL

SQLite is right for development: one file, no service, works offline. For a live site with more
than a handful of concurrent readers, move to Postgres.

1. In `prisma/schema.prisma`, change the datasource:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Set `DATABASE_URL` to your Postgres connection string.
3. Run `npx prisma migrate deploy`.
4. Run `npm run db:seed`.

**No application code changes.** Every query goes through Prisma.

One thing to know: SQLite's `LIKE` is case-insensitive for ASCII, and Postgres's is not. After
migrating, add `mode: 'insensitive'` to the `contains` filters in `src/lib/books.ts` and
`src/lib/search.ts` — Prisma rejects that option on SQLite, which is why it is not there already.

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

## Checklist before opening the doors

- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] The admin password is no longer `changeme123`
- [ ] `SESSION_SECRET` is fresh and not the development one
- [ ] `APP_URL` is the real domain
- [ ] A sandbox purchase completed end to end (see `docs/PAYMENTS.md`)
- [ ] The Flutterwave webhook points at `https://<domain>/api/webhooks/flutterwave`
- [ ] `/sitemap.xml` and `/robots.txt` return sensible content
- [ ] `view-source:` on a paid book's reader page shows no page text beyond the preview
