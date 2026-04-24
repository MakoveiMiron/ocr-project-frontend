'use client';

import Link from 'next/link';
import { clearAccessToken } from '@/lib/auth';
import { withBasePath } from '@/lib/basePath';
import { useAuthStatus } from '@/lib/useAuthStatus';

export function NavAuth() {
  const { isAuthenticated, isLoading, profile } = useAuthStatus();

  function onLogout() {
    clearAccessToken();
    window.location.href = withBasePath('/login');
  }

  if (isLoading) {
    return <span className="small">Checking session…</span>;
  }

  if (!isAuthenticated) {
    return (
      <>
        <Link href="/login" className="btn btn-secondary">Sign in</Link>
        <Link href="/register" className="btn btn-primary">Register</Link>
      </>
    );
  }

  return (
    <>
      <Link href="/" className="btn btn-secondary">App</Link>
      {profile?.name ? <span className="small">{profile.name}</span> : null}
      <button type="button" className="btn btn-primary" onClick={onLogout}>Logout</button>
    </>
  );
}
