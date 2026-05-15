# ECE Echo Feedback & Satisfaction Command System

Frontend-only React + Vite + TypeScript app for collecting workplace, service, visitor, applicant, and account feedback across ECE sites.

## Current Architecture

- React 18 + Vite + TypeScript
- React Router for client-side routing
- Zustand + LocalStorage for temporary feedback, dashboard, alert, and case data
- No production backend database yet
- Static-hosting ready for Vercel, Netlify, and Cloudflare Pages

Dashboards start at zero and update from real LocalStorage feedback submissions. Unhappy, Very Unhappy, High, or Critical feedback creates alert/case activity locally.

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Production Build

```bash
npm run build
npm run preview
```

The production build outputs static files to:

```text
dist
```

## Deployment Files

- `vercel.json` rewrites all routes to `index.html` for React Router refresh support on Vercel.
- `public/_redirects` rewrites all routes to `index.html` for Netlify and Cloudflare Pages.
- Do not commit `.env` files with secrets. `.env.example` contains placeholder development values only.

## Deploy To Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, click **Add New Project** and import the repository.
3. Use these settings:

```text
Framework preset: Vite
Install command: npm install
Build command: npm run build
Output directory: dist
```

4. Leave environment variables empty unless a future backend is added.
5. Deploy.

Vercel uses `vercel.json` so refreshing `/submit-feedback`, `/dashboard`, or any other route returns the React app.

## Deploy To Netlify

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Netlify, choose **Add new site > Import an existing project**.
3. Use these settings:

```text
Build command: npm run build
Publish directory: dist
```

4. Deploy.

Netlify uses `public/_redirects`, copied into `dist/_redirects`, so React Router routes work on refresh.

## Deploy To Cloudflare Pages

1. Push this repository to GitHub or GitLab.
2. In Cloudflare Pages, choose **Create a project** and connect the repository.
3. Use these settings:

```text
Framework preset: Vite or None
Build command: npm run build
Build output directory: dist
Production branch: main
```

4. Deploy.

Cloudflare Pages can use the `_redirects` file copied into `dist` for SPA route fallback.

## Important Limitations

- Data is stored in the visitor's browser LocalStorage, not in a shared database.
- Feedback, alerts, tickets, and reports are local to each browser/device.
- Authentication is demo/local state only.
- A backend API and database should be added before using this as a multi-user production system.
