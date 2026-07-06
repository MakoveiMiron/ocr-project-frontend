export function encodeStorageKeyForRoute(storageKey: string): string {
  return storageKey
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/');
}
