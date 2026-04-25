'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { withBasePath } from '@/lib/basePath';
import { useAuthStatus } from '@/lib/useAuthStatus';

export function NavAuth() {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const pathname = usePathname();
  const isProfilePage = /(^|\/)dashboard(\/|$)/.test(pathname);

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
      {!isProfilePage ? <Link href="/dashboard" className="btn btn-secondary">Profile</Link> : null}
      <button type="button" className="btn btn-primary" onClick={onLogout}>Logout</button>
    </>
  );
}
