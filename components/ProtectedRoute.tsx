'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { hasAccessToken } from '@/lib/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!hasAccessToken()) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/dashboard')}`);
      return;
    }

    setAllowed(true);
    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking || !allowed) {
    return (
      <section className="container" style={{ paddingBottom: 40 }}>
        <div className="card"><p className="small">Checking authentication…</p></div>
      </section>
    );
  }

  return <>{children}</>;
}
