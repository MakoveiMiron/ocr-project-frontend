# Frontend deploy notes

This app now uses a static Next.js export (`output: 'export'`) so it can be deployed to **GitHub Pages** and served in production mode (no `next dev`).

## 1) Build locally for GitHub Pages

```bash
npm install
NEXT_PUBLIC_API_BASE_URL=https://web-production-3a8489.up.railway.app/api/v1 npm run build:github-pages
```

Build output is generated in `out/`.

## 2) Configure repository path (required for project pages)

If your repo is hosted at `https://<user>.github.io/<repo>`, set:

```bash
NEXT_PUBLIC_BASE_PATH=/<repo>
```

Then build with:

```bash
NEXT_PUBLIC_BASE_PATH=/<repo> NEXT_PUBLIC_API_BASE_URL=https://web-production-3a8489.up.railway.app/api/v1 npm run build:github-pages
```

If you deploy to a custom domain or user root site (`https://<user>.github.io`), leave `NEXT_PUBLIC_BASE_PATH` empty.

## 3) Deploy `out/` to GitHub Pages

Use your preferred method (GitHub Actions, `gh-pages` branch, etc.) and publish the contents of `out/`.

## API notes

- Static hosting cannot run Next.js API routes.
- The frontend calls the backend directly using `NEXT_PUBLIC_API_BASE_URL`.
- Set `NEXT_PUBLIC_API_BASE_URL` to your deployed backend API base (including `/api/v1`).
