import { clearAccessToken } from '@/lib/auth';
import { withBasePath } from '@/lib/basePath';
import { config } from '@/lib/config';
import {
  AuthMeResponse,
  AuthCallbackResponse,
  AuthorizationUrlResponse,
  BillingCheckoutResponse,
  BillingPortalResponse,
  DocumentDetail,
  DocumentSummary,
  OrganizationMember,
  OrganizationSummary,
  ProcessDocumentRequest,
  ProcessDocumentResponse,
  RegisterOrganizationRequest,
  RegisterOrganizationResponse,
  UploadInitRequest,
  UploadInitResponse
} from '@/lib/types';

const accessTokenStorageKey = 'ocr_access_token';

function getStoredAccessToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.sessionStorage.getItem(accessTokenStorageKey) || '';
}

function buildHeaders(init?: RequestInit, accessToken?: string) {
  const headers = new Headers(init?.headers);
  const resolvedAccessToken = accessToken || getStoredAccessToken();
  if (resolvedAccessToken) {
    headers.set('Authorization', `Bearer ${resolvedAccessToken}`);
  }
  return headers;
}

function formatRequestUrl(path: string) {
  return `${config.apiBaseUrl}${path}`;
}

function isLikelyCorsError(error: unknown) {
  if (!(error instanceof TypeError)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return message.includes('failed to fetch') || message.includes('networkerror');
}

function toNetworkError(path: string, error: unknown) {
  if (isLikelyCorsError(error)) {
    const target = formatRequestUrl(path);
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'the current frontend origin';

    return new Error(
      `Unable to reach API (${target}) from ${origin}. This is usually a CORS issue. ` +
        'Please allow this origin in backend CORS settings (Access-Control-Allow-Origin).'
    );
  }

  return error instanceof Error ? error : new Error('Unexpected network error');
}

async function assertResponseOk(response: Response) {
  if (response.ok) {
    return;
  }

  if (response.status === 401 && typeof window !== 'undefined') {
    clearAccessToken();
    window.location.href = withBasePath('/login?reason=unauthorized');
  }

  const text = await response.text();
  throw new Error(text ? `API error: ${response.status} - ${text}` : `API error: ${response.status}`);
}

export async function apiFetch<T>(path: string, init?: RequestInit, accessToken?: string): Promise<T> {
  const headers = buildHeaders(init, accessToken);
  if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(formatRequestUrl(path), {
      ...init,
      headers,
      cache: 'no-store'
    });
  } catch (error) {
    throw toNetworkError(path, error);
  }

  await assertResponseOk(response);

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export async function apiFetchRaw(path: string, init?: RequestInit, accessToken?: string): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(formatRequestUrl(path), {
      ...init,
      headers: buildHeaders(init, accessToken),
      cache: 'no-store'
    });
  } catch (error) {
    throw toNetworkError(path, error);
  }

  await assertResponseOk(response);

  return response;
}

export function createAuthorizationUrl(payload: { state: string; nonce: string }) {
  return apiFetch<AuthorizationUrlResponse>('/auth/authorization-url', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function exchangeAuthCallback(payload: { code: string; state: string }) {
  return apiFetch<AuthCallbackResponse>('/auth/callback', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchAuthMe(accessToken: string) {
  return apiFetch<AuthMeResponse>('/auth/me', undefined, accessToken);
}

export function registerOrganization(payload: RegisterOrganizationRequest, accessToken: string) {
  return apiFetch<RegisterOrganizationResponse>('/organizations/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, accessToken);
}

export function fetchMyOrganization(accessToken: string) {
  return apiFetch<OrganizationSummary>('/organizations/me', undefined, accessToken);
}

export function fetchOrganizationMembers(organizationId: string, accessToken: string) {
  return apiFetch<OrganizationMember[]>(`/organizations/${organizationId}/members`, undefined, accessToken);
}

export function initDocumentUpload(payload: UploadInitRequest, accessToken: string) {
  return apiFetch<UploadInitResponse>('/documents/upload/init', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, accessToken);
}

export function processDocument(documentId: string, payload: ProcessDocumentRequest, accessToken: string) {
  return apiFetch<ProcessDocumentResponse>(`/documents/${documentId}/process`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, accessToken);
}

export function fetchDocuments(accessToken: string) {
  return apiFetch<DocumentSummary[]>('/documents', undefined, accessToken);
}

export function fetchDocumentDetail(documentId: string, accessToken: string) {
  return apiFetch<DocumentDetail>(`/documents/${documentId}`, undefined, accessToken);
}

export function downloadDocument(documentId: string, accessToken: string) {
  return apiFetchRaw(`/documents/${documentId}/download`, undefined, accessToken);
}

export function createBillingCheckout(planCode: string, accessToken: string) {
  return apiFetch<BillingCheckoutResponse>(`/billing/checkout/${planCode}`, { method: 'POST' }, accessToken);
}

export function createBillingPortal(accessToken: string) {
  return apiFetch<BillingPortalResponse>('/billing/portal', { method: 'POST' }, accessToken);
}
