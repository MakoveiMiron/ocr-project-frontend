# PDF SaaS Frontend (Next.js)

Next.js App Router frontend for OCR document conversion with a self-contained FastAPI backend.

## Local development

### 1) Start backend

```bash
python -m scripts.storage_admin storage:init
python -m scripts.storage_admin db:init
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Backend URL: `http://localhost:8000`  
API prefix: `/api/v1`

### 2) Configure frontend environment

```bash
cp .env.example .env.local
```

Default API is already local:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

### 3) Run frontend

```bash
npm install
npm run dev
```

Frontend URL: `http://localhost:3000`

## Build

```bash
npm run build
npm run lint
```

## Integration summary

- Central API client: `lib/api.ts`
- Config/env handling: `lib/config.ts`
- Auth/session/token handling: `lib/auth.ts`
- Upload + OCR flow: `components/UploadForm.tsx`
- Document status + download: `app/document/DocumentDetailClient.tsx`

Detailed backend endpoint mapping: [`API_INTEGRATION.md`](./API_INTEGRATION.md)

## Production setup

Use env variables in deployment:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
API_BASE_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_OIDC_ENABLED=false
NEXT_PUBLIC_OIDC_PROVIDER=OIDC
```

Reverse proxy and VPS notes: see [`README-DEPLOY.md`](./README-DEPLOY.md).
