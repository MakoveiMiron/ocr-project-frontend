'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function LoginCallbackContent() {
  const [message, setMessage] = useState('Finalizing sign in...');
  const router = useRouter();

  useEffect(() => {
    setMessage('OIDC callback is disabled. Redirecting to sign in...');
    const timeout = window.setTimeout(() => router.replace('/login'), 1200);
    return () => window.clearTimeout(timeout);
  }, [router]);

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ maxWidth: 680 }}>
        <h1 style={{ marginTop: 0 }}>OIDC callback</h1>
        <p className="small">{message}</p>
        <Link className="btn btn-primary" href="/login">Back to sign in</Link>
      </div>
    </section>
  );
}

export default function LoginCallbackPage() {
  return (
    <Suspense fallback={<section className="container"><p className="small">Loading callback…</p></section>}>
      <LoginCallbackContent />
    </Suspense>
  );
}
