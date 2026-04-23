const oidcAuthUrl = process.env.NEXT_PUBLIC_OIDC_AUTH_URL;
const oidcClientId = process.env.NEXT_PUBLIC_OIDC_CLIENT_ID;
const oidcAudience = process.env.NEXT_PUBLIC_OIDC_AUDIENCE;

export async function getAccessToken(): Promise<string> {
  return 'dev-token';
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
