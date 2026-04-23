# Frontend – demo csomag

Ez a frontend **bemutató felületnek** van szánva. Nem teljes értékű éles kliens, hanem prezentációs és demó célra előkészített Next.js app.

## Indítás

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Opcionális backend kapcsolat
Ha a külön backendhez akarod kötni:

```env
API_BASE_URL=https://a-backended.up.railway.app/api/v1
```

A böngészős hívások a beépített Next.js proxy-n (`/api/v1/*`) mennek át, így nem a frontend okoz CORS hibát.

## Javasolt használat
- landing oldal
- demo UI
- funkcióbemutatás
- későbbi teljes frontend alapja
