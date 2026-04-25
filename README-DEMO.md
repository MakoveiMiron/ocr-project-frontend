# Frontend demó mód

Ez a frontend használható demó célra is, de a jelenlegi konfiguráció teljes API integrációra van felkészítve.

## Indítás

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Backend csatlakozás

Lokális FastAPI backendhez:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Éles környezethez:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.sajatdomain.hu/api/v1
```

A kliens közvetlenül a backend HTTP API-t hívja.
