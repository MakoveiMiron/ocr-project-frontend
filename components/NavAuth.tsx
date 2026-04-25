'use client';

import Link from 'next/link';
import { signOut } from '@/lib/auth';
import { withBasePath } from '@/lib/basePath';
import { useAuthStatus } from '@/lib/useAuthStatus';

export function NavAuth() {
  const { isAuthenticated, isLoading, profile } = useAuthStatus();

  async function onLogout() {
    await signOut();
    window.location.href = withBasePath('/login');
  }

  if (isLoading) {
    return null;
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
      <Link href="/dashboard" className="btn btn-secondary">Profile</Link>
      {profile?.name ? <span className="small">{profile.name}</span> : null}
      <button type="button" className="btn btn-primary" onClick={onLogout}>Logout</button>
    </>
  );
}
