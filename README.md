# Nubian Luxe Braiding Lounge

A full-stack luxury booking application for Nubian Luxe Braiding Lounge — a marketing site, in-app booking wizard with payments, and an admin dashboard for managing appointments.

The site walks a client from "I want braids" to "I have an appointment with a deposit on file" in five steps, then gives the salon owner a single place to review, confirm, and track every booking.

## What's in here

- **Marketing site** — luxury black-and-gold landing page with an autoplaying splash video (separate cuts for desktop and mobile), hero, services, pricing, accommodations, color chart, FAQ, testimonials, footer.
- **Multi-step booking wizard** at `/book` — Service → Tier → Date & Time → Client Info → Payment → Confirmation. Tier can be pre-selected via `/book?tier=REGULAR|PREMIUM|VIP`.
- **Stripe payments** — real PaymentIntents with two charging modes per booking (deposit-only or pay-in-full upfront).
- **Webhook** at `/api/stripe/webhook` — records cleared payments without auto-confirming (the salon owner reviews each booking manually).
- **Admin dashboard** at `/admin` — overview KPIs, appointments tab with search/filter and per-row actions, blocked-dates manager.
- **Auth** via Clerk — Clerk-themed sign-in/sign-up. Admin gating via env-var allowlist (Clerk user ID and/or email).
- **Persistence** via Supabase Postgres + Prisma 7 (with Row Level Security enabled).

## Technology Stack

### Application
- **Next.js 16** (App Router, Server Components, Server Actions, Turbopack)
- **React 19** + **TypeScript 6**
- **Tailwind CSS v4** (configured via `@tailwindcss/postcss`, no JS config file)
- **motion** (formerly framer-motion) for transitions

### Auth
- **Clerk** (`@clerk/nextjs`) with the official `@clerk/themes` `dark` base theme

### Database / ORM
- **Supabase** (managed Postgres 17 + connection pooler + REST API)
- **Prisma 7** with the `@prisma/adapter-pg` driver adapter
- Row Level Security enabled on every public table (Prisma uses the `postgres` role which bypasses RLS — RLS is for blocking accidental anon-key access)

### Payments
- **Stripe** (live mode) — `stripe` server SDK + `@stripe/react-stripe-js` Elements
- Catalog: 3 Products with one-time Prices (Booking Deposit $100, Premium Tier Fee $25, VIP Tier Fee $50). The actual charge amount is computed dynamically per booking and the price IDs ride along in PaymentIntent metadata for revenue attribution.

### Email
- **Resend** + **react-email** (wired but currently unused — see TODO.md §8)

### Storage / Media
- Splash videos in `/public/assets/` — separate cuts served per viewport (desktop ≥ 768px → `nubian-luxe-vid.mp4`, mobile < 768px → `nubian-luxe-mobile.mp4`)
- **UploadThing** installed but not yet wired

## Booking pricing model

The site charges a **booking fee** at booking time that's always required, plus an optional **service fee** that the client can pay upfront or defer to the appointment.

- **Booking fee** = `$100 deposit + tier fee` (tier fee is `$0` Regular, `$25` Premium, `$50` VIP).
- **Service fee** = the listed starting price for the chosen service (e.g. `"$300+"` → `$300`).

| User chooses | Charged at booking | Owed at appointment |
|---|---|---|
| **Pay at appointment** *(default)* | `$100 deposit + tier fee` | `service_price − $100` |
| **Pay in full now** | `service_price + tier fee` (deposit credited toward service) | `$0` |

The same total (`service_price + tier_fee`) is collected either way — the toggle just shifts when. Tier fee is non-refundable; deposit credits toward the service balance.

## Data model

Three Prisma models in `prisma/schema.prisma`:

- **`Client`** — name, email (unique), phone, notes, timestamps.
- **`Appointment`** — client snapshot fields (so an appointment is intact even if the Client row is deleted), `service` + `serviceCategory` + `servicePrice` (cents) + `servicePaid` (bool), `tier` + `tierFee` (cents), `deposit` (cents), `date` + `duration` (mins), `status` (`PENDING|CONFIRMED|CANCELLED|COMPLETED|NO_SHOW`), Stripe `paymentIntentId`, `depositPaid`, `tierFeePaid`, reminder flags, timestamps.
- **`BlockedDate`** — `date` + optional `reason` (drives the Date & Time step's available slots).

Migrations live in `prisma/migrations/` and are kept in lock-step with Supabase via either `prisma migrate dev` (when the Supavisor pooler is reachable) or the Supabase MCP `apply_migration` tool with a follow-up `prisma migrate resolve --applied` (when the pooler isn't).

## App routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Marketing landing page |
| `/book` | Public | Booking wizard (accepts `?tier=REGULAR\|PREMIUM\|VIP` to pre-select) |
| `/book/confirmed?id=…` | Public | Post-payment confirmation page |
| `/sign-in/[[...sign-in]]` | Public | Clerk sign-in |
| `/sign-up/[[...sign-up]]` | Public | Clerk sign-up |
| `/account` | Authenticated | Client account dashboard with appointment history |
| `/admin` | Authenticated + allowlisted | Owner dashboard (Overview / Appointments / Blocked Dates tabs) |
| `/api/stripe/webhook` | Stripe-only (signature-verified) | Records `payment_intent.succeeded`/`failed` and `charge.refunded` |

`/account` and `/admin` are protected by Clerk middleware (`src/proxy.ts`). `/admin` adds an env-var allowlist on top.

## Admin dashboard

`/admin` shows three tabs:

- **Overview** — KPI cards for *Today*, *Upcoming* (paid + future), *Pending* (unpaid, needs follow-up), *Revenue* (deposits collected). Today's schedule + an "Awaiting Payment" pending list. *Pending vs Upcoming is determined by `depositPaid`, not the appointment status — the status field is owned by the manual confirm flow.*
- **Appointments** — full search + status filter, expandable rows with all fields, per-row actions: Confirm / Mark Completed / No Show / Cancel / Restore, plus Mark Service Paid / Unmark when a service balance was deferred.
- **Blocked Dates** — add/remove dates the salon is closed; these are excluded from the booking wizard's date picker.

## Stripe webhook behavior

By design, the webhook **does not auto-confirm** appointments — the salon owner reviews each booking and confirms manually via the admin panel. On `payment_intent.succeeded` the webhook only:

1. Verifies the Stripe signature
2. Looks up the `Appointment` by `stripePaymentIntentId`
3. Sets `depositPaid=true`, `tierFeePaid=true` (if applicable), and `servicePaid=true` (if `pay_service_upfront` metadata is `"true"`)
4. Logs and returns 200

The handler is idempotent (guards on `depositPaid`), handles `payment_intent.payment_failed` (logs only) and `charge.refunded` (logs for now), and isolates errors so a single failing event doesn't put Stripe into a retry loop. See `src/app/api/stripe/webhook/route.ts` and TODO.md §8 for the path back to auto-confirmation when ready.

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/PaulCertified/nubianluxe.git
cd nubianluxe
npm install
```

### 2. Configure environment variables

Copy `.env.local.example` to `.env` and fill in real values:

```bash
# Supabase Postgres — use the Supavisor *session pooler* connection string from
# the Connect modal in the Supabase dashboard. The direct host is IPv6-only on
# the free tier and won't be reachable from most networks.
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# Supabase JS client (only needed if you query Supabase directly from the client)
NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_…"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_…"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_…
CLERK_SECRET_KEY=sk_…
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Stripe (live keys for production, test keys for local development)
STRIPE_SECRET_KEY=sk_…
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_…
STRIPE_WEBHOOK_SECRET=whsec_…  # see "Webhooks" below

# Admin allowlist — a user is admin if their Clerk user ID matches OR their email matches
CLERK_ADMIN_USER_ID=user_…
ADMIN_EMAIL=you@example.com
```

### 3. Initialize the database

If the pooler is reachable from your network:

```bash
npx prisma migrate dev      # creates and applies the schema
npx prisma generate         # generates the typed client
```

If `prisma migrate dev` hangs with a `P1001 SocketTimeout`, your network is blocking outbound traffic to the Supavisor pooler. Either work from a different network (a phone hotspot is the quickest test), get IT to allowlist `*.pooler.supabase.com`, or enable Supabase's IPv4 add-on for static IPs.

### 4. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000.

### 5. Test webhooks locally

Use the Stripe CLI to forward events to your local server:

```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed `whsec_…` into `.env` as `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`. Trigger a test event with:

```bash
stripe trigger payment_intent.succeeded
```

## Deployment

Currently set up for **Vercel** (`vercel.json` not present — uses Vercel's Next.js defaults). For a non-Vercel host, the only requirement is Node.js 18+ and the env vars above.

```bash
npm install -g vercel
vercel --prod
```

After deploying, register the production webhook in Stripe:

1. Go to https://dashboard.stripe.com/webhooks → **Add endpoint**
2. URL: `https://<your-domain>/api/stripe/webhook`
3. Listen for: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` in your hosting env

## Project structure

```
nubianluxe/
├── prisma/
│   ├── schema.prisma                    # data model
│   └── migrations/                      # SQL migrations (kept in sync with Supabase)
├── public/
│   ├── assets/
│   │   ├── nubian-luxe-vid.mp4          # desktop splash (16:9)
│   │   └── nubian-luxe-mobile.mp4       # mobile splash (9:16)
│   └── …                                # other static assets
├── src/
│   ├── app/
│   │   ├── page.tsx                     # marketing landing
│   │   ├── book/                        # booking wizard route
│   │   ├── account/                     # client account dashboard
│   │   ├── admin/                       # owner dashboard
│   │   ├── sign-in/, sign-up/           # Clerk
│   │   ├── api/stripe/webhook/          # Stripe webhook handler
│   │   ├── actions/                     # server actions (booking + admin)
│   │   └── globals.css                  # Tailwind v4 + design tokens + components
│   ├── components/
│   │   ├── HeroSection.tsx              # video splash + animated headline
│   │   ├── Navigation.tsx, Footer.tsx
│   │   ├── booking/                     # 6 wizard steps + BookingWizard
│   │   ├── admin/                       # AdminDashboard + panels
│   │   ├── account/                     # client-facing account pages
│   │   └── …                            # marketing sections
│   ├── lib/
│   │   ├── booking-data.ts              # SERVICES + TIERS catalog + helpers
│   │   ├── stripe.ts                    # Stripe client + price ID constants
│   │   └── prisma.ts                    # Prisma client singleton
│   ├── emails/                          # react-email templates (currently unused)
│   ├── generated/prisma/                # generated Prisma client (not committed)
│   └── proxy.ts                         # Clerk middleware
├── package.json
└── prisma.config.ts
```

## Follow-ups

Open setup tasks live in [TODO.md](./TODO.md):

1. ~~Baseline Prisma migrations once the pooler responds~~ — done
2. RLS policies (only needed if/when we use the Supabase JS client from the browser)
3. Resend / UploadThing / `NEXT_PUBLIC_APP_URL` env vars
4. Swap Clerk dev keys → production keys before launch
5. Supabase project reference (project name, ref, region, dashboard link)
6. Stripe catalog reference (product IDs, price IDs, account link)
7. Stripe webhook signing secret + endpoint registration
8. Re-enable auto-confirmation + customer Resend email when ready

## License

Proprietary — © Nubian Luxe Braiding Lounge.

## Credits

Designed and developed by Paul Gipson.
