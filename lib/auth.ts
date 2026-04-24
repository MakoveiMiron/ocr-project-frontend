import { AuthMeResponse } from '@/lib/types';
import { createSessionLogin, fetchAuthMe } from '@/lib/api';

const devAuthEnabled = process.env.NEXT_PUBLIC_DEV_AUTH_ENABLED === 'true';
const devAccessToken = process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN || 'dev-token';

const accessTokenStorageKey = 'ocr_access_token';
const accessTokenExpiresAtStorageKey = 'ocr_access_token_expires_at';
const sessionActiveStorageKey = 'ocr_session_active';

function inBrowser() {
  return typeof window !== 'undefined';
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

    if (window.sessionStorage.getItem(sessionActiveStorageKey) === 'true') {
      return '';
    }
  }

  if (devAuthEnabled) {
    return devAccessToken;
  }

  throw new Error('Authentication required. Please sign in to continue.');
}

export function setAccessToken(token: string, expiresInSeconds?: number) {
  if (!inBrowser()) return;
  window.sessionStorage.setItem(accessTokenStorageKey, token);
  window.sessionStorage.setItem(sessionActiveStorageKey, 'true');
  setTokenExpiry(expiresInSeconds);
}

export function clearAccessToken() {
  if (!inBrowser()) return;
  window.sessionStorage.removeItem(accessTokenStorageKey);
  window.sessionStorage.removeItem(accessTokenExpiresAtStorageKey);
  window.sessionStorage.removeItem(sessionActiveStorageKey);
}

export function hasAccessToken() {
  if (!inBrowser()) return false;
  if (window.sessionStorage.getItem(sessionActiveStorageKey) === 'true') {
    return true;
  }

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
    window.sessionStorage.setItem(sessionActiveStorageKey, 'true');
  }
}

export async function getCurrentUserProfile(): Promise<AuthMeResponse> {
  const token = await getAccessToken();

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
