'use client';

import Link from 'next/link';
import { useAuthStatus } from '@/lib/useAuthStatus';

export function NavLinks() {
  const { isAuthenticated } = useAuthStatus();

  return (
    <>
      <Link href="/">Home</Link>
      {isAuthenticated ? <Link href="/subscription">Subscription</Link> : null}
    </>
  );
}
