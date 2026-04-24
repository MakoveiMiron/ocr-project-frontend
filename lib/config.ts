const defaultApiBaseUrl = 'https://web-production-3a8489.up.railway.app/api/v1';

const serverApiBaseUrl =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.REACT_APP_API_URL ??
  process.env.VITE_API_URL ??
  defaultApiBaseUrl;

const clientApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.REACT_APP_API_URL ??
  process.env.VITE_API_URL ??
  defaultApiBaseUrl;

export const config = {
  serverApiBaseUrl,
  apiBaseUrl: typeof window === 'undefined' ? serverApiBaseUrl : clientApiBaseUrl,
  oidcProviderName:
    process.env.NEXT_PUBLIC_OIDC_PROVIDER ??
    process.env.REACT_APP_OIDC_PROVIDER ??
    process.env.VITE_OIDC_PROVIDER ??
    'OIDC'
};
