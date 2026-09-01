# Turning on real payments

Right now the app runs in **mock mode**. Everything about buying a book works — the phone number, the
"approve on your phone" screen, the wait, the success seal, the book unlocking — but **no real money
moves**. When the app starts in mock mode it says so in the terminal:

```
[payments] No Flutterwave credentials found - running in MOCK mode.
```

This is on purpose. It means you can show the whole product to Agati, to funders, or to anyone else
before a merchant account exists. Switching to real money is configuration only; no code changes.

---

## What you need

A **Flutterwave** account. Flutterwave handles MTN and Airtel Mobile Money in Rwanda, in Rwandan
francs. Only you can open this account — it needs your organisation's legal and banking details, so
it is not something that can be set up on your behalf.

---

## Step 1 — Create the account

1. Go to [flutterwave.com](https://flutterwave.com) and create an account for Agati Library.
2. Complete business verification for **Rwanda**. Expect to supply registration documents and a bank
   account. This takes a few days.

Until verification finishes you can still use the **sandbox**, which behaves exactly like the real
thing with fake money. Do that first.

---

## Step 2 — Copy your keys

In the Flutterwave dashboard, go to **Settings → API Keys**. You need two values:

- **Client ID**
- **Client Secret**

Put them in your `.env` file:

```
FLW_ENV="sandbox"
FLW_CLIENT_ID="paste-your-client-id"
FLW_CLIENT_SECRET="paste-your-client-secret"
```

> **Never commit `.env` to git, and never paste these keys into an email or a chat message.** Anyone
> holding them can take money through your account. `.env` is already in `.gitignore`.

---

## Step 3 — Set up the webhook

The webhook is how Flutterwave tells the site that a payment succeeded, even if the reader closed
their browser.

1. In the dashboard, go to **Settings → Webhooks**.
2. Set the URL to:

   ```
   https://your-domain.example/api/webhooks/flutterwave
   ```

   It must be a public HTTPS address. `localhost` will not work — while developing, use a tunnel such
   as `ngrok` or `cloudflared` to expose your machine.

3. Invent a long random **Secret Hash**. Generate one with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Paste that same value into **both** the dashboard field and your `.env`:

   ```
   FLW_SECRET_HASH="the-same-long-random-value"
   ```

   They must match exactly. The site refuses any webhook whose signature does not verify against this
   secret, which is what stops somebody forging a "payment succeeded" message.

---

## Step 4 — Test in the sandbox

Restart the app. The mock-mode warning should be gone.

Buy a book using Flutterwave's sandbox test numbers (in the dashboard under **Developers → Test
credentials**). Check that:

- the waiting screen appears
- the payment completes
- the book unlocks and appears on `/account`
- the purchase shows as **Paid**

Then deliberately break something: try a payment and cancel it. The purchase should show as failed
and the book should stay locked.

---

## Step 5 — Go live

Only after a sandbox purchase has completed end to end:

```
FLW_ENV="production"
```

and replace the Client ID and Secret with the **live** ones from the dashboard. Point the production
webhook at your live domain and use a fresh Secret Hash for it.

Do one real purchase yourself, for the cheapest book, and confirm the money arrives in the Agati
account before telling anyone the site is open.

---

## How the money is protected

Worth knowing, in plain terms:

- **Prices come from the database, never from the browser.** Somebody editing the page in their
  browser to say a book costs 1 RWF changes nothing — the server looks the price up itself.
- **A "payment succeeded" message is never believed on its own.** When Flutterwave notifies us, the
  site checks the signature, then goes back to Flutterwave and asks what that charge actually was,
  and compares the amount, the currency and the reference against its own record. Only then is a book
  unlocked.
- **Paying twice is impossible.** Fulfilment is idempotent: a repeated notification does nothing.
- **A lost notification is not a lost purchase.** The checkout page also asks the server directly, so
  if the webhook never arrives the reader still gets their book.

---

## If something goes wrong

| What you see | What it usually means |
|---|---|
| Mock-mode warning still in the terminal | `FLW_CLIENT_ID` or `FLW_CLIENT_SECRET` is empty or misspelled in `.env` |
| "Flutterwave auth failed" | Wrong keys, or live keys used while `FLW_ENV="sandbox"` |
| Webhooks rejected | `FLW_SECRET_HASH` does not match the dashboard exactly |
| Payment stuck on "waiting" | The customer never approved on their phone; nothing was charged |
| "not a valid Rwandan mobile number" | Only 078/079 (MTN) and 072/073 (Airtel) numbers are accepted |
