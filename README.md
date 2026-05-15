# ECE Echo Feedback & Satisfaction Command System

A production-oriented React + Vite + TypeScript feedback platform for ECE Contact Centers. It collects workplace, service, visitor, applicant, and account feedback for Noel, Macias, and Consuelo, then powers a protected admin dashboard from real submitted records only.

## Stack

- React 18 + Vite + TypeScript
- Tailwind CSS, Framer Motion, Lucide React, Recharts
- React Router for SPA routing
- Zustand for UI/session state
- Supabase for production database, auth, and attachment storage
- Vitest for validation tests and Playwright for form happy paths

## Data Policy

Production feedback must be stored in Supabase. The app has a browser LocalStorage fallback only for local development when Supabase env variables are missing. In production, submissions fail loudly if Supabase is not configured, so live feedback is not silently trapped on one device.

Dashboard values always start at zero and calculate from real submitted feedback records only. No fake production analytics are loaded automatically.

## Environment Variables

Create `.env.local` for local development or configure these in Vercel:

```bash
APP_URL=https://ece-feedback-system-bay.vercel.app
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Only `VITE_*` variables are exposed to the browser. Never expose a Supabase service-role key with a `VITE_` prefix.

## Supabase Setup

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor.
3. Create at least one Supabase Auth user.
4. Insert a matching profile row with `role = 'admin'`:

```sql
insert into public.profiles (id, full_name, email, role)
values ('AUTH_USER_UUID', 'Admin User', 'admin@example.com', 'admin');
```

5. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel.

## Local Development

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## Quality Checks

```bash
npm run build
npm run lint
npm test
npm run test:e2e
```

Playwright starts a Vite dev server on port `5175`.

## Deployment

### Vercel

```text
Framework preset: Vite
Install command: npm install
Build command: npm run build
Output directory: dist
```

`vercel.json` rewrites every route to `/index.html` so React Router refreshes work.

### Netlify

```text
Build command: npm run build
Publish directory: dist
```

`public/_redirects` provides the SPA fallback.

### Cloudflare Pages

```text
Framework preset: Vite or None
Build command: npm run build
Build output directory: dist
Production branch: main
```

## Admin Access

Admin pages are protected by the app route guard and Supabase profile role checks. Users with `role = 'viewer'` can submit feedback but cannot access admin analytics.

## Important Notes

- Do not commit `.env`, `.env.local`, `.vercel`, `dist`, or `node_modules`.
- Do not add hardcoded dashboard numbers or fake production feedback.
- Keep attachments limited to images and PDFs up to 5MB.
- If Supabase is not configured, cross-device persistence will not work.
