# Frontend deploy notes

This app uses a static Next.js export (`output: 'export'`) so it can be deployed to **GitHub Pages**.

## Recommended: GitHub Actions deploy (already included)

A workflow is available at `.github/workflows/deploy-pages.yml`. It builds `out/` and deploys it to GitHub Pages automatically.

### 1) Enable Pages in repository settings

In GitHub repository settings:

- **Pages → Build and deployment → Source: GitHub Actions**

If Pages source is set to `Deploy from branch`, GitHub may show the repository `README.md` instead of the built app.

### 2) Configure environment variables (optional but recommended)

In **Settings → Secrets and variables → Actions → Variables**:

- `NEXT_PUBLIC_API_BASE_URL` = your backend API base URL (including `/api/v1`)
- `NEXT_PUBLIC_BASE_PATH` = optional override for custom setup
  - For standard project pages (`https://<user>.github.io/<repo>`), you can leave this empty; the build auto-detects `/<repo>`.

### 3) Push to `main` or run workflow manually

The workflow will:

- run `npm ci`
- run `npm run build:github-pages`
- publish the generated `out/` folder

## Local build for verification

```bash
npm install
NEXT_PUBLIC_API_BASE_URL=https://example.com/api/v1 npm run build:github-pages
```

## API notes

- Static hosting cannot run Next.js API routes.
- The frontend calls the backend directly using `NEXT_PUBLIC_API_BASE_URL`.
