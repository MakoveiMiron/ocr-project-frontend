const serverApiBaseUrl =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'https://web-production-3a8489.up.railway.app/api/v1';

const clientApiBaseUrl = '/api/v1';

export const config = {
  serverApiBaseUrl,
  apiBaseUrl: typeof window === 'undefined' ? serverApiBaseUrl : clientApiBaseUrl
};
