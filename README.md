# Compeat

Compeat is a multi-tenant institutional platform for competitions, events, and inter-college collaboration. This MVP is built for high daily engagement across students, club leads, and campus admins.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Zustand
- react-hook-form + zod
- Supabase Auth, Postgres, RLS, and Storage

## What ships in this MVP

- Email + OTP authentication with Supabase
- Tenant onboarding for schools and colleges
- Club creation, member assignment, and scoped roles
- Event creation with poster upload
- Cross-campus event discovery
- Student registration and organizer approvals
- Basic PDF certificate generation to Supabase Storage

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your Supabase project values:

```bash
cp .env.example .env.local
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (recommended locally as `http://localhost:3000`)

3. In Supabase SQL editor, run:

```sql
-- paste contents of supabase/schema.sql
```

4. In Supabase Auth settings:

- Enable email authentication
- Enable OTP / magic link email flow
- Set the site URL to your local or deployed app URL
- Add `/auth/callback` as an allowed redirect path

5. Start the app:

```bash
npm run dev
```

## Database notes

The schema is in [supabase/schema.sql](/E:/Compeat/supabase/schema.sql).

Highlights:

- Every tenant-owned table includes `school_id`
- UUID primary keys across the board
- Foreign keys, timestamps, and targeted indexes
- Explicit RLS policies for memberships, clubs, events, and registrations
- Storage buckets for `event-assets` and `certificates`

## Product structure

- `app/` routes, layouts, and route handlers
- `components/` shared UI, layout shell, and reusable primitives
- `features/auth` OTP login
- `features/onboarding` tenant onboarding
- `features/clubs` club workflows
- `features/events` event explorer, registrations, approvals, certificates
- `lib/supabase` clients and server-side queries

## Important implementation choices

- Server Components handle initial data fetching
- Client Components are used only for interactivity and forms
- Mutations are handled through Server Actions
- Zustand powers client-side event explorer filters and app shell state
- The landing page shows a public-style event preview while authenticated users get the full event workspace

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Deployment notes

- Vercel works out of the box once env vars are set
- Supabase RLS is required for production isolation
- The app assumes `SUPABASE_SERVICE_ROLE_KEY` is server-only and never exposed to the client

## Node version

Next.js 16 and parts of the lint toolchain are happiest on Node `20.19+`. The app was scaffolded on Node `20.17.0`, so upgrading Node is recommended before production deploys.
