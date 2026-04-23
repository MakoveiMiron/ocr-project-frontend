# PDF SaaS Frontend

Next.js App Router frontend for secure PDF upload, subscription, and processing UX.

## Highlights
- App Router
- CSP/security headers in `next.config.mjs`
- Auth token never persisted in localStorage in this starter
- Upload flow uses signed URLs from the backend
- Billing plan cards and dashboard
- Tenant-aware document list UI

## Run locally
```bash
cp .env.example .env.local
npm install
npm run dev
```
