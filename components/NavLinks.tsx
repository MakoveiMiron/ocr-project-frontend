'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStatus } from '@/lib/useAuthStatus';

export function NavLinks() {
  const { isAuthenticated } = useAuthStatus();
  const pathname = usePathname();
  const isProfilePage = pathname === '/dashboard' || pathname.endsWith('/dashboard/');

  return (
    <>
      <Link href='/' aria-current={pathname === '/' ? 'page' : undefined} className={`nav-link${pathname === '/' ? ' active' : ''}`}>Home</Link>
      {isAuthenticated && !isProfilePage ? <Link href='/subscription' aria-current={pathname === '/subscription' ? 'page' : undefined} className={`nav-link${pathname === '/subscription' ? ' active' : ''}`}>Subscription</Link> : null}
    </>
  );
}
