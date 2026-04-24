import { config } from '@/lib/config';

function buildHeaders(init?: RequestInit, accessToken?: string) {
  const headers = new Headers(init?.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return headers;
}

export async function apiFetch<T>(path: string, init?: RequestInit, accessToken?: string): Promise<T> {
  const headers = buildHeaders(init, accessToken);
  if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text ? `API error: ${response.status} - ${text}` : `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export async function apiFetchRaw(path: string, init?: RequestInit, accessToken?: string): Promise<Response> {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers: buildHeaders(init, accessToken),
    cache: 'no-store'
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text ? `API error: ${response.status} - ${text}` : `API error: ${response.status}`);
  }

  return response;
}
