'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStatus } from '@/lib/useAuthStatus';

export function NavLinks() {
  const { isAuthenticated } = useAuthStatus();
  const pathname = usePathname();
  const isProfilePage = /(^|\/)dashboard(\/|$)/.test(pathname);

  return (
    <>
      <Link href="/">Home</Link>
      {isAuthenticated && !isProfilePage ? <Link href="/subscription">Subscription</Link> : null}
    </>
  );
}
