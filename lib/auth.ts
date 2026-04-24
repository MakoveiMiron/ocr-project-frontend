import { AuthCallbackResponse, AuthMeResponse } from '@/lib/types';
import { createAuthorizationUrl, createSessionLogin, exchangeAuthCallback, fetchAuthMe } from '@/lib/api';

const devAuthEnabled = process.env.NEXT_PUBLIC_DEV_AUTH_ENABLED === 'true';
const devAccessToken = process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN || 'dev-token';

const accessTokenStorageKey = 'ocr_access_token';
const accessTokenExpiresAtStorageKey = 'ocr_access_token_expires_at';
const oidcStateStorageKey = 'ocr_oidc_state';
const oidcNonceStorageKey = 'ocr_oidc_nonce';
const postLoginRedirectStorageKey = 'ocr_post_login_redirect';

function inBrowser() {
  return typeof window !== 'undefined';
}

function generateRandomString() {
  if (!inBrowser() || !window.crypto?.getRandomValues) {
    return '';
  }

  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function setTokenExpiry(expiresInSeconds?: number) {
  if (!inBrowser()) return;
  if (!expiresInSeconds || expiresInSeconds <= 0) {
    window.sessionStorage.removeItem(accessTokenExpiresAtStorageKey);
    return;
  }

  const expiresAt = Date.now() + expiresInSeconds * 1000;
  window.sessionStorage.setItem(accessTokenExpiresAtStorageKey, String(expiresAt));
}

function isTokenExpired() {
  if (!inBrowser()) return false;
  const expiresAtValue = window.sessionStorage.getItem(accessTokenExpiresAtStorageKey);
  if (!expiresAtValue) return false;

  const expiresAt = Number(expiresAtValue);
  if (Number.isNaN(expiresAt)) return false;

  return Date.now() >= expiresAt;
}

export async function getAccessToken(): Promise<string> {
  if (inBrowser()) {
    const token = window.sessionStorage.getItem(accessTokenStorageKey);
    if (token && !isTokenExpired()) {
      return token;
    }

    if (token && isTokenExpired()) {
      clearAccessToken();
    }
  }

  if (devAuthEnabled) {
    return devAccessToken;
  }

  throw new Error('Authentication required. Please sign in to continue.');
}

export function markSessionActive() {
  if (!inBrowser()) return;
  window.sessionStorage.setItem(sessionActiveStorageKey, 'true');
}

export function setAccessToken(token: string, expiresInSeconds?: number) {
  if (!inBrowser()) return;
  window.sessionStorage.setItem(accessTokenStorageKey, token);
  markSessionActive();
  setTokenExpiry(expiresInSeconds);
}

export function clearAccessToken() {
  if (!inBrowser()) return;
  window.sessionStorage.removeItem(accessTokenStorageKey);
  window.sessionStorage.removeItem(accessTokenExpiresAtStorageKey);
  window.sessionStorage.removeItem(oidcStateStorageKey);
  window.sessionStorage.removeItem(oidcNonceStorageKey);
  window.sessionStorage.removeItem(postLoginRedirectStorageKey);
}

export function hasAccessToken() {
  if (!inBrowser()) return false;
  const token = window.sessionStorage.getItem(accessTokenStorageKey);
  if (!token) return false;

  if (isTokenExpired()) {
    clearAccessToken();
    return false;
  }

  return true;
}

export async function signInWithSession(email: string, password: string) {
  const response = await createSessionLogin({ email, password });
  if (response.access_token) {
    setAccessToken(response.access_token, response.expires_in);
    return;
  }

  if (inBrowser()) {
    markSessionActive();
  }
}

export async function startOidcLogin(postLoginRedirect = '/dashboard') {
  const state = generateRandomString();
  const nonce = generateRandomString();

  if (!state || !nonce) {
    throw new Error('Login is only available in the browser.');
  }

  window.sessionStorage.setItem(oidcStateStorageKey, state);
  window.sessionStorage.setItem(oidcNonceStorageKey, nonce);
  window.sessionStorage.setItem(postLoginRedirectStorageKey, postLoginRedirect);

  const response = await createAuthorizationUrl({ state, nonce });

  if (!response.authorization_url) {
    throw new Error('Missing authorization URL from backend.');
  }

  window.location.href = response.authorization_url;
}

export async function completeOidcCallback(code: string, state: string): Promise<AuthCallbackResponse> {
  if (!inBrowser()) {
    throw new Error('Callback handling is only available in the browser.');
  }

  const expectedState = window.sessionStorage.getItem(oidcStateStorageKey);
  if (!expectedState || expectedState !== state) {
    throw new Error('OIDC state validation failed. Please sign in again.');
  }

  const response = await exchangeAuthCallback({ code, state });
  setAccessToken(response.access_token, response.expires_in);
  window.sessionStorage.removeItem(oidcStateStorageKey);
  window.sessionStorage.removeItem(oidcNonceStorageKey);

  return response;
}

export function consumePostLoginRedirect() {
  if (!inBrowser()) {
    return '/dashboard';
  }

  const redirectPath = window.sessionStorage.getItem(postLoginRedirectStorageKey) || '/dashboard';
  window.sessionStorage.removeItem(postLoginRedirectStorageKey);
  return redirectPath;
}

export async function getCurrentUserProfile(): Promise<AuthMeResponse> {
  let token = '';

  try {
    token = await getAccessToken();
  } catch {
    token = '';
  }

  try {
    return await fetchAuthMe(token);
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      clearAccessToken();
      throw new Error('Your session expired. Please sign in again.');
    }
    throw error;
  }
}
