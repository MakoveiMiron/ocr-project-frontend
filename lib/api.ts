import { clearAccessToken } from '@/lib/auth';
import { withBasePath } from '@/lib/basePath';
import { config } from '@/lib/config';
import {
  AuthMeResponse,
  AuthCallbackResponse,
  AuthorizationUrlResponse,
  SessionLoginResponse,
  BillingCheckoutResponse,
  BillingPortalResponse,
  DocumentDetail,
  DocumentArtifactsResponse,
  DeleteDocumentResponse,
  DocumentIrResponse,
  DocumentQaResponse,
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

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getStoredAccessToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.sessionStorage.getItem(accessTokenStorageKey) || '';
}

function buildHeaders(init?: RequestInit, accessToken?: string, includeAuth = true) {
  const headers = new Headers(init?.headers);
  const resolvedAccessToken = accessToken || getStoredAccessToken();
  if (includeAuth && resolvedAccessToken) {
    headers.set('Authorization', `Bearer ${resolvedAccessToken}`);
  }
  return headers;
}

function formatRequestUrl(path: string) {
  return `${config.apiBaseUrl}${path}`;
}

function resolveApiUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  if (pathOrUrl.startsWith('/')) {
    return `${new URL(config.apiBaseUrl).origin}${pathOrUrl}`;
  }

  return `${config.apiBaseUrl}/${pathOrUrl}`;
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

async function buildApiError(response: Response, path: string) {
  const fallbackMessage = `API error: ${response.status}`;

  let parsed: unknown;
  try {
    parsed = await response.clone().json();
  } catch {
    try {
      const raw = await response.text();
      return new ApiError(raw ? `${fallbackMessage} - ${raw}` : fallbackMessage, response.status);
    } catch {
      return new ApiError(fallbackMessage, response.status);
    }
  }

  if (typeof parsed === 'object' && parsed !== null && 'detail' in parsed) {
    const detail = (parsed as { detail?: unknown }).detail;
    if (typeof detail === 'string') {
      return new ApiError(detail, response.status);
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item && 'msg' in item) {
            return String((item as { msg?: unknown }).msg ?? '').trim();
          }
          return '';
        })
        .filter(Boolean);

      if (messages.length) {
        return new ApiError(messages.join('; '), response.status);
      }
    }
  }

  return new ApiError(fallbackMessage, response.status);
}

async function assertResponseOk(response: Response, path: string) {
  if (response.ok) {
    return;
  }

  if (response.status === 401 && typeof window !== 'undefined') {
    clearAccessToken();

    const isAuthCheck = path === '/auth/me';
    const isLoginPage = window.location.pathname.endsWith(withBasePath('/login'));

    if (!isAuthCheck && !isLoginPage) {
      window.location.href = withBasePath('/login?reason=unauthorized');
    }
  }

  throw await buildApiError(response, path);
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  accessToken?: string,
  includeAuth = true
): Promise<T> {
  const headers = buildHeaders(init, accessToken, includeAuth);
  if (!headers.has('Content-Type') && init?.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(formatRequestUrl(path), {
      ...init,
      headers,
      credentials: 'include',
      cache: 'no-store'
    });
  } catch (error) {
    throw toNetworkError(path, error);
  }

  await assertResponseOk(response, path);

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export async function apiFetchRaw(
  path: string,
  init?: RequestInit,
  accessToken?: string,
  includeAuth = true
): Promise<Response> {
  const headers = buildHeaders(init, accessToken, includeAuth);

  let response: Response;
  try {
    response = await fetch(formatRequestUrl(path), {
      ...init,
      headers,
      credentials: 'include',
      cache: 'no-store'
    });
  } catch (error) {
    throw toNetworkError(path, error);
  }

  await assertResponseOk(response, path);

  return response;
}

export async function uploadDocumentBinary(uploadUrl: string, file: File, accessToken?: string) {
  const headers = buildHeaders(undefined, accessToken, true);
  const formData = new FormData();
  formData.append('file', file);

  let response: Response;
  const resolvedUploadUrl = resolveApiUrl(uploadUrl);
  try {
    response = await fetch(resolvedUploadUrl, {
      method: 'PUT',
      headers,
      body: formData,
      credentials: 'include',
      cache: 'no-store'
    });
  } catch (error) {
    throw toNetworkError(uploadUrl, error);
  }

  if (!response.ok) {
    throw await buildApiError(response, uploadUrl);
  }
}

export function createAuthorizationUrl(payload: { state: string; nonce: string }) {
  return apiFetch<AuthorizationUrlResponse>(
    '/auth/authorization-url',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    undefined,
    false
  );
}

export function exchangeAuthCallback(payload: { code: string; state: string }) {
  return apiFetch<AuthCallbackResponse>(
    '/auth/callback',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    undefined,
    false
  );
}

export function createSessionLogin(payload: { email: string; password: string }) {
  return apiFetch<SessionLoginResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    undefined,
    false
  );
}

export function fetchAuthMe(accessToken?: string) {
  return apiFetch<AuthMeResponse>('/auth/me', undefined, accessToken);
}

export function registerOrganization(payload: RegisterOrganizationRequest, accessToken?: string) {
  return apiFetch<RegisterOrganizationResponse>(
    '/organizations/register',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    accessToken,
    Boolean(accessToken)
  );
}

export function fetchMyOrganization(accessToken?: string) {
  return apiFetch<OrganizationSummary>('/organizations/me', undefined, accessToken);
}

export function fetchOrganizationMembers(organizationId: string, accessToken?: string) {
  return apiFetch<OrganizationMember[]>(`/organizations/${organizationId}/members`, undefined, accessToken);
}

export function initDocumentUpload(payload: UploadInitRequest, accessToken?: string) {
  return apiFetch<UploadInitResponse>('/documents/upload/init', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, accessToken);
}

export function processDocument(documentId: string, payload: ProcessDocumentRequest, accessToken?: string) {
  return apiFetch<ProcessDocumentResponse>(`/documents/${documentId}/process`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, accessToken);
}

export function reprocessDocument(documentId: string, payload: ProcessDocumentRequest, accessToken?: string) {
  return apiFetch<ProcessDocumentResponse>(`/documents/${documentId}/reprocess`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, accessToken);
}

export function convertDocument(
  documentId: string,
  options?: { translation_friendly?: boolean; preserve_layout?: boolean },
  accessToken?: string
) {
  const query = new URLSearchParams();
  if (typeof options?.translation_friendly === 'boolean') {
    query.set('translation_friendly', String(options.translation_friendly));
  }
  if (typeof options?.preserve_layout === 'boolean') {
    query.set('preserve_layout', String(options.preserve_layout));
  }
  const suffix = query.size ? `?${query.toString()}` : '';

  return apiFetch<ProcessDocumentResponse>(`/documents/${documentId}/convert${suffix}`, {
    method: 'POST'
  }, accessToken);
}

export function fetchDocuments(accessToken?: string) {
  return apiFetch<DocumentSummary[]>('/documents', undefined, accessToken);
}

export function fetchDocumentDetail(documentId: string, accessToken?: string) {
  return apiFetch<DocumentDetail>(`/documents/${documentId}`, undefined, accessToken);
}

export function fetchDocumentQa(documentId: string, accessToken?: string) {
  return apiFetch<DocumentQaResponse>(`/documents/${documentId}/qa`, undefined, accessToken);
}

export function fetchDocumentArtifacts(documentId: string, accessToken?: string) {
  return apiFetch<DocumentArtifactsResponse>(`/documents/${documentId}/artifacts`, undefined, accessToken);
}

export function fetchDocumentIr(documentId: string, accessToken?: string) {
  return apiFetch<DocumentIrResponse>(`/documents/${documentId}/ir`, undefined, accessToken);
}

export function downloadDocument(documentId: string, accessToken?: string) {
  return apiFetchRaw(`/documents/${documentId}/download`, undefined, accessToken);
}

export function deleteDocument(documentId: string, accessToken?: string) {
  return apiFetch<DeleteDocumentResponse>(`/documents/${documentId}`, { method: 'DELETE' }, accessToken);
}

export function createBillingCheckout(planCode: string, accessToken?: string) {
  return apiFetch<BillingCheckoutResponse>(`/billing/checkout/${planCode}`, { method: 'POST' }, accessToken);
}

export function createBillingPortal(accessToken?: string) {
  return apiFetch<BillingPortalResponse>('/billing/portal', { method: 'POST' }, accessToken);
}

export function logoutSession() {
  return apiFetch<void>('/auth/logout', { method: 'POST' });
}
