function normalizeBasePath(value?: string) {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, '');
}

export function getClientBasePath() {
  const configuredBasePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);
  if (configuredBasePath) {
    return configuredBasePath;
  }

  if (typeof window === 'undefined') {
    return '';
  }

  if (!window.location.hostname.endsWith('github.io')) {
    return '';
  }

  const [firstSegment] = window.location.pathname.split('/').filter(Boolean);
  return firstSegment ? `/${firstSegment}` : '';
}

export function withBasePath(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const basePath = getClientBasePath();
  return `${basePath}${normalizedPath}`;
}
