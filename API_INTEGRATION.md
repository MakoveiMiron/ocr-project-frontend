# API Integration Guide (FastAPI self-contained backend)

## Required backend base URL

Frontend API base URL:

- Local: `http://localhost:8000/api/v1`
- Production example: `https://api.example.com/api/v1`

Configured via environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
API_BASE_URL=http://localhost:8000/api/v1
```

## Backend startup

```bash
python -m scripts.storage_admin storage:init
python -m scripts.storage_admin db:init
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

OpenAPI docs:

- `http://localhost:8000/docs`
- `http://localhost:8000/openapi.json`

## Auth + session model

- Login: `POST /auth/login`
- Me: `GET /auth/me`
- Logout: `POST /auth/logout`
- Optional OIDC flow: `/auth/authorization-url` + `/auth/callback`

Frontend behavior:

1. Access token is kept in `sessionStorage`.
2. All API requests use `credentials: include` for session cookies.
3. If token exists, `Authorization: Bearer <token>` is added.
4. On `401`, token is cleared and user is redirected to `/login` (except `/auth/me` check).

## Registration and organization

- `POST /organizations/register`
- `GET /organizations/me`
- `GET /organizations/{organization_id}/members`

If register response has `checkout_url`, frontend redirects there.

## Document upload + OCR flow

1. `POST /documents/upload/init`
2. Use returned `upload_url` for `PUT` multipart upload (`file` field)
3. `POST /documents/{document_id}/process` with `{ "engine_policy": "auto" }`
4. Poll `GET /documents/{document_id}`
5. Download DOCX from `GET /documents/{document_id}/download` when `docx_available=true`

The frontend never touches SQLite, Redis, or backend file storage directly.

## Billing flow

- Checkout: `POST /billing/checkout/{plan_code}`
- Portal: `POST /billing/portal`

If Stripe is not configured, backend errors are surfaced with user-friendly UI messages.

## CORS/cookies in local dev

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

Backend must allow frontend origin in CORS. For HTTP local dev, backend may need:

```env
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAMESITE=lax
```

## Known limitations

- Static hosting needs backend CORS configured correctly.
- Billing actions depend on backend Stripe configuration.
- OIDC sign-in button is shown only when `NEXT_PUBLIC_OIDC_ENABLED=true`.
