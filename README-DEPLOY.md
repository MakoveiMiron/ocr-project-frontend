# Deployment Notes (Frontend + self-contained FastAPI backend)

## Architecture

- Frontend: Next.js app (this repository)
- Backend: FastAPI service with embedded storage/cache (`http://localhost:8000` in local)
- API path prefix: `/api/v1`

No Redis/PostgreSQL/MySQL/MongoDB is required for default backend operation.

## Environment variables

Required frontend variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
API_BASE_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_OIDC_ENABLED=false
NEXT_PUBLIC_OIDC_PROVIDER=OIDC
```

## Hosting suggestions (Hostinger / Rekhost / generic VPS)

1. Run backend as systemd service (or process manager).
2. Run frontend with `npm run build && npm run start`.
3. Put Nginx/Caddy reverse proxy in front.
4. Terminate TLS at reverse proxy.

## Nginx reverse proxy example

```nginx
server {
  listen 443 ssl;
  server_name app.yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

server {
  listen 443 ssl;
  server_name api.yourdomain.com;

  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Then configure frontend with:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
```

## Cookie/session considerations

- Frontend requests include `credentials: include`.
- Backend CORS must explicitly allow frontend origin(s).
- Production backend should typically use:
  - `SESSION_COOKIE_SECURE=true`
  - `SESSION_COOKIE_SAMESITE=lax` (or stricter setup based on topology)

## Billing

- Frontend calls `/billing/checkout/{plan_code}` and `/billing/portal`.
- If Stripe is not configured on backend, UI shows friendly error instead of crashing.

## Known limitations

- Billing endpoints depend on Stripe backend configuration.
- OIDC flow is optional and UI is hidden unless explicitly enabled.
- Static hosting requires correct CORS on backend APIs.
