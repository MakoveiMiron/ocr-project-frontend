const oidcAuthUrl = process.env.NEXT_PUBLIC_OIDC_AUTH_URL;
const oidcClientId = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID;
const oidcAudience = process.env.NEXT_PUBLIC_OIDC_AUDIENCE;
const devAuthEnabled = process.env.NEXT_PUBLIC_DEV_AUTH_ENABLED === 'true';
const devAccessToken = process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN || 'dev-token';
const accessTokenStorageKey = 'ocr_access_token';

export async function getAccessToken(): Promise<string> {
  if (typeof window !== 'undefined') {
    const token = window.sessionStorage.getItem(accessTokenStorageKey);
    if (token) {
      return token;
    }
  }

  if (devAuthEnabled) {
    return devAccessToken;
  }

  throw new Error('Authentication required. Please sign in to continue.');
}

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(accessTokenStorageKey, token);
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(accessTokenStorageKey);
}

export function hasAccessToken() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.sessionStorage.getItem(accessTokenStorageKey));
}

export function getOidcLoginUrl() {
  if (!oidcAuthUrl || !oidcClientId || typeof window === 'undefined') {
    return null;
  }

  const redirectUri = `${window.location.origin}/login/callback`;
  const authUrl = new URL(oidcAuthUrl);
  authUrl.searchParams.set('client_id', oidcClientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  if (oidcAudience) {
    authUrl.searchParams.set('audience', oidcAudience);
  }

  return authUrl.toString();
}
