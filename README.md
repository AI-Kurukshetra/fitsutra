# FitSutra

FitSutra is a premium gym management platform designed for modern fitness centers in India. It simplifies memberships, class scheduling, payments, staff management, and performance tracking in one powerful system. Built for ambitious gym owners, FitSutra enhances member experience while driving operational efficiency and sustainable business growth.

Alternative to: MindBody

## Tech Stack
- Next.js (App Router)
- Supabase (auth, database, storage)
- Vercel (deployment)

## Local Development
```bash
npm install
npm run dev
```

## Environment Variables
Create a `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SEED_OWNER_ID=optional_auth_user_id
DEFAULT_GYM_ID=optional_gym_id_for_public_leads
BOOKING_ADMIN_EMAIL=admin@example.com
RESEND_API_KEY=optional_resend_key
```

## Supabase Setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Seed demo data by running either:
   - SQL: `supabase/seed.sql`
   - Script: `npm run seed`
4. Sign up in the app to create a gym workspace and profile (owner role).
5. In Supabase Realtime, enable replication for:
   `gyms`, `profiles`, `locations`, `members`, `membership_plans`, `memberships`, `staff`, `staff_shifts`,
   `payroll_entries`, `classes`, `class_sessions`, `appointments`, `bookings`, `waitlists`, `payments`,
   `products`, `orders`, `order_items`, `campaigns`, `messages`, `promo_codes`, `loyalty_rewards`,
   `referrals`, `reports`, `widgets`, `marketplace_listings`, `app_settings`, `integrations`, `forms`,
   `waivers`, `waiver_signatures`, `leads`, `finance_offers`.
6. Create a Storage bucket named `fitsutra-assets` (public) for brand assets uploads.

## Notes
- The dashboard shows demo data until Supabase is configured.
- Auth uses Supabase REST endpoints; realtime updates use `@supabase/supabase-js`.
- Realtime subscriptions listen to core tables and refresh the UI instantly.
- Analytics lives at `/app/analytics`.
- Module pages live under `/app/*` (Scheduling, CRM, Payments, Marketing, Reporting, Staff, Brand, Advanced, Growth).
- CRUD lists include search and quick filters.
- Book a demo page lives at `/book-demo` and sends requests to `leads`.
