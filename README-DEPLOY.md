# Frontend notes

For local development:

```bash
cp .env.example .env.local
npm install
npm run dev
```

For a deployed backend, set server-side target URL:

```bash
API_BASE_URL=https://web-production-3a8489.up.railway.app/api/v1
```

`NEXT_PUBLIC_API_BASE_URL` is optional and only used on the server as a fallback.
Client-side requests always go through the Next.js `/api/v1/*` proxy to avoid browser CORS issues.
