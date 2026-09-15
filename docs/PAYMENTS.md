# Turning on real payments

The app runs in mock mode by default. Buying a book works all the way through (phone number,
approve-on-your-phone screen, waiting, success, book unlocks) but no money moves. You'll see this in
the terminal on startup:

```
[payments] No Flutterwave credentials found - running in MOCK mode.
```

That's intentional, so the whole thing can be demoed to Agati or to funders before a merchant
account exists. Going live is config only, no code changes.

## What you need

A Flutterwave account. They handle MTN and Airtel Mobile Money in Rwanda, in RWF. This part has to
be done by Agati, not by a developer, since it needs the organisation's legal and banking details.

## 1. Create the account

Sign up at [flutterwave.com](https://flutterwave.com) and complete business verification for
Rwanda. They'll ask for registration documents and a bank account. Takes a few days.

You can use the sandbox while you wait. It behaves the same with fake money. Do that first.

## 2. Keys

Dashboard > Settings > API Keys. You need the Client ID and the Client Secret.

```
FLW_ENV="sandbox"
FLW_CLIENT_ID="paste-your-client-id"
FLW_CLIENT_SECRET="paste-your-client-secret"
```

Don't commit `.env` and don't send these keys over email or WhatsApp. Anyone with them can take
money through the account. `.env` is already gitignored.

## 3. Webhook

The webhook is how Flutterwave tells the site a payment went through, even if the reader closed
their browser halfway.

Dashboard > Settings > Webhooks. URL:

```
https://your-domain.example/api/webhooks/flutterwave
```

Has to be public HTTPS. localhost won't work, so use ngrok or cloudflared while developing.

Then make up a long random secret hash:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

and put the same value in the dashboard field and in `.env`:

```
FLW_SECRET_HASH="the-same-long-random-value"
```

These have to match exactly. The site rejects any webhook whose signature doesn't verify, which is
what stops someone POSTing a fake "payment succeeded".

## 4. Test in sandbox

Restart. The mock mode warning should be gone.

Buy a book with Flutterwave's sandbox test numbers (dashboard, Developers > Test credentials) and
check that:

- the waiting screen shows up
- the payment completes
- the book unlocks and shows on `/account`
- the purchase reads as Paid

Then cancel a payment on purpose. It should end up failed and the book should stay locked.

## 5. Go live

Only once a sandbox purchase has worked end to end:

```
FLW_ENV="production"
```

Swap in the live Client ID and Secret, point the production webhook at the live domain, and use a
new secret hash for it.

Do one real purchase yourself, cheapest book, and confirm the money lands in the Agati account
before telling anyone the site is open.

## How the money side is protected

- Prices are read from the database, never from the request body. Editing the page in devtools to
  say a book costs 1 RWF does nothing.
- A "payment succeeded" webhook is not trusted by itself. We verify the signature, then call
  Flutterwave back to ask what the charge actually was, and compare amount, currency and reference
  against our own record before unlocking anything.
- Fulfilment is idempotent, so a repeated notification doesn't double-charge or double-grant.
- If the webhook never arrives, the checkout page polls the server directly, so the reader still
  gets the book.

## Troubleshooting

| Symptom | Usually means |
|---|---|
| still seeing the mock mode warning | `FLW_CLIENT_ID` or `FLW_CLIENT_SECRET` empty or misspelled in `.env` |
| "Flutterwave auth failed" | wrong keys, or live keys with `FLW_ENV="sandbox"` |
| webhooks rejected | `FLW_SECRET_HASH` doesn't match the dashboard |
| payment stuck on waiting | customer never approved on their phone, nothing was charged |
| "not a valid Rwandan mobile number" | only 078/079 (MTN) and 072/073 (Airtel) are accepted |
