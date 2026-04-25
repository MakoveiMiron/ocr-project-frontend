const defaultApiBaseUrl = 'http://localhost:8000/api/v1';

function normalizeApiBaseUrl(rawUrl?: string) {
  if (!rawUrl) return defaultApiBaseUrl;

  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return defaultApiBaseUrl;

  if (/\/api\/v\d+$/i.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}/api/v1`;
}

const serverApiBaseUrl = normalizeApiBaseUrl(
  process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.REACT_APP_API_URL ??
    process.env.VITE_API_URL
);

const clientApiBaseUrl = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.REACT_APP_API_URL ??
    process.env.VITE_API_URL
);

export const config = {
  serverApiBaseUrl,
  apiBaseUrl: typeof window === 'undefined' ? serverApiBaseUrl : clientApiBaseUrl,
  oidcProviderName:
    process.env.NEXT_PUBLIC_OIDC_PROVIDER ??
    process.env.REACT_APP_OIDC_PROVIDER ??
    process.env.VITE_OIDC_PROVIDER ??
    'OIDC',
  oidcEnabled: process.env.NEXT_PUBLIC_OIDC_ENABLED === 'true'
};
