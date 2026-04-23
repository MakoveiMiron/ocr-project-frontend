export const config = {
  serverApiBaseUrl:
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    'https://web-production-3a8489.up.railway.app/api/v1',
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1'
};
