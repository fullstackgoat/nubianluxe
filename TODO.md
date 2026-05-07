# Setup Follow-ups

Notes from the Supabase + Prisma setup session. Come back to these.

## 1. ✅ DONE — Prisma migrations baselined

Both migrations are now marked applied via:

```bash
npx prisma migrate resolve --applied 20260506175547_init
npx prisma migrate resolve --applied 20260506180005_enable_rls_lockdown
```

`prisma migrate status` reports **"Database schema is up to date!"**. Future
`prisma migrate dev` runs will pick up cleanly from the next change to
`schema.prisma`.

### Network gotcha (important — keep in mind)

The Supavisor pooler (`aws-1-us-east-1.pooler.supabase.com`) is **blocked on
the company network** — TCP connects but the postgres protocol handshake
silently times out. Almost certainly a corporate firewall / DPI inspecting or
dropping outbound traffic to AWS Supavisor IPs.

Workarounds:

- **Develop on a personal hotspot or non-corporate network** — verified to
  work end-to-end.
- For long-term: ask IT to allowlist `*.pooler.supabase.com` (specifically
  the AWS ELB IPs in `aws-1-us-east-1.pooler.supabase.com`), or enable
  Supabase's IPv4 add-on ($4/mo) and use the direct host
  (`db.kkgxeckfjcuvjssdulcm.supabase.co:5432`) — though that ELB might also
  be blocked. The IPv4 add-on uses static IPs that IT could allowlist
  permanently.

Quick connectivity probe (run when testing a new network):

```bash
cd nubianluxe && node -r dotenv/config -e "const{Client}=require('pg');const c=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},connectionTimeoutMillis:12000});c.connect().then(()=>c.query('select 1')).then(()=>console.log('OK ✓')).catch(e=>console.log('FAIL:',e.message)).finally(()=>c.end())" dotenv_config_path=.env
```

## 2. RLS policies (only if/when we use Supabase JS from the browser)

Currently RLS is enabled on `Client`, `Appointment`, `BlockedDate` with **no
policies** — full lockdown. Prisma works fine because the `postgres` role
bypasses RLS. The browser-exposed `NEXT_PUBLIC_SUPABASE_ANON_KEY` is powerless.

If we ever need to query Supabase directly from the client (`@supabase/supabase-js`
in the browser), we must design per-table policies first. Likely shape:

- `Client`: only the owning user (Clerk `sub` mapped to a `clerkId` column) can SELECT/UPDATE their row
- `Appointment`: only the owning client can SELECT their appointments
- `BlockedDate`: SELECT is fine for everyone (drives the booking calendar UI); INSERT/UPDATE/DELETE admin-only

Linking Clerk auth to Supabase RLS requires either:
- A Postgres function that reads a JWT claim (Clerk → Supabase JWT integration), or
- Doing all writes via a server route that uses the service role key

## 3. Remaining env vars not yet configured

`nubianluxe/.env` is missing real values for these (placeholders are in
`.env.local.example`):

- **`STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** — REQUIRED before the booking wizard can create real PaymentIntents. Use **LIVE keys** (`sk_live_…` / `pk_live_…`) since the catalog (see §6) was created in live mode. Get them from https://dashboard.stripe.com/acct_1TU8d7BMtUlbX58I/apikeys
- `STRIPE_WEBHOOK_SECRET` — needed when wiring up the webhook for `payment_intent.succeeded` to flip appointments to `CONFIRMED` automatically
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL` (for production, will need to switch from `http://localhost:3000`)
- UploadThing keys (the `uploadthing` package is installed)

## 4. Production Clerk keys

Clerk is currently using **development** keys
(`pk_test_...` / `sk_test_...`). Before launch, swap in production keys from
the Clerk dashboard and ensure the production domain is added to allowed origins.

## 5. Supabase project details (for reference)

- Project name: `nubianluxe`
- Project ref: `kkgxeckfjcuvjssdulcm`
- Region: `us-east-1`
- Org: `paulcertified` (`frdkmtudijapqzmxlmxf`)
- Plan: Free
- Dashboard: https://supabase.com/dashboard/project/kkgxeckfjcuvjssdulcm

## 7. Stripe webhook — register the endpoint and set the signing secret

The webhook handler lives at `src/app/api/stripe/webhook/route.ts`. It handles
`payment_intent.succeeded` (flips appointment to CONFIRMED + emails the client),
`payment_intent.payment_failed` (logged), and `charge.refunded` (logged for now,
needs refund flow later). It's idempotent: only acts on the PENDING → CONFIRMED
transition, so Stripe retries are safe. Email failures are isolated and won't
trigger Stripe to retry.

### A. Local development testing — use Stripe CLI

The cleanest way to test webhooks against `localhost:3000` is the Stripe CLI:

```bash
brew install stripe/stripe-cli/stripe
stripe login                                  # follow the browser flow
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The `listen` command prints a line like:

```
> Ready! Your webhook signing secret is whsec_aBcDeFgHiJkLmNoPqRsTuV (^C to quit)
```

Copy that `whsec_…` into `nubianluxe/.env` as `STRIPE_WEBHOOK_SECRET`, then
restart `npm run dev` so the new value is picked up.

Trigger a test event from another terminal:

```bash
stripe trigger payment_intent.succeeded
```

Note about modes: by default `stripe login` authenticates you in **test** mode.
The booking wizard currently has **LIVE** Stripe keys in `.env`, so a real
charge would attempt against live Stripe. To test end-to-end without real
money, swap to test keys (`sk_test_…` / `pk_test_…`) for local dev — and
remember the live price IDs in `src/lib/stripe.ts` only resolve in live
dashboards, so revenue attribution metadata will look orphaned in test mode.
That's fine for testing the booking flow itself.

### B. Production registration — use the Stripe Dashboard

Once the site is deployed (e.g. `https://nubianluxebrand.com`):

1. Go to https://dashboard.stripe.com/webhooks → **Add an endpoint**
2. Endpoint URL: `https://<production-domain>/api/stripe/webhook`
3. Listen for these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. After creating, click the endpoint → reveal the **Signing secret** (`whsec_…`)
5. Add to your production environment as `STRIPE_WEBHOOK_SECRET` (Vercel project
   settings → Environment Variables, or wherever the app is hosted)

## 8. Future: re-enable auto-confirmation + customer email

Currently when a payment succeeds, the webhook only marks
`depositPaid`/`tierFeePaid` true — it deliberately does **not** flip the
appointment to `CONFIRMED` or send the customer the confirmation email. The
owner reviews each booking and confirms manually (via the admin panel, which
calls the `confirmBooking` server action in `src/app/actions/booking.ts`).

When ready to automate, in `src/app/api/stripe/webhook/route.ts`:

1. Re-add the `Resend` + `BookingConfirmationEmail` imports and the
   `isResendConfigured` / `sendConfirmationEmail` helpers (see git history of
   this file for the previous implementation).
2. In the `payment_intent.succeeded` case, change the idempotency check from
   `if (appointment.depositPaid)` to `if (appointment.status === "CONFIRMED")`.
3. Add `status: "CONFIRMED"` back to the `prisma.appointment.update` data.
4. Call `await sendConfirmationEmail(appointment);` after the DB update.
5. Make sure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set in `.env`
   (see §3) and the Resend domain is verified.

Also worth considering at the same time:

- An owner-notification email/SMS the moment payment clears, so the manual
  confirmation flow has a low-latency "new booking!" signal.
- A small `/admin` UI for one-click confirm/cancel on PENDING appointments.

## 6. Stripe catalog (LIVE mode)

Account: `acct_1TU8d7BMtUlbX58I` — **Nubian Luxe Braiding Lounge**
Dashboard: https://dashboard.stripe.com/acct_1TU8d7BMtUlbX58I

Products + Prices created via Stripe MCP and referenced in `src/lib/stripe.ts`:

| Product | Product ID | Price ID | Amount |
|---|---|---|---|
| Booking Deposit | `prod_UT66BvdcYxutex` | `price_1TU9uGBMtUlbX58IU2RdWvpR` | $100.00 |
| Premium Tier Booking Fee | `prod_UT66RnjCvazWSv` | `price_1TU9uGBMtUlbX58InGBSRdNt` | $25.00 |
| VIP Tier Booking Fee | `prod_UT66rm8DgaWk1K` | `price_1TU9uHBMtUlbX58IK6Er3OOC` | $50.00 |

Note: the booking wizard charges a **PaymentIntent with a dynamically computed
amount** (`deposit + tier fee`), not a Checkout Session built from these prices.
The price IDs are sent in PaymentIntent `metadata` (`stripe_deposit_price`,
`stripe_tier_price`) so Stripe revenue reports can attribute charges to the
correct product line. Service-level catalog (Box Braids, Goddess Braids, etc.)
was intentionally **not** created — those prices are quote-based and would be
misleading as fixed Stripe Prices.
