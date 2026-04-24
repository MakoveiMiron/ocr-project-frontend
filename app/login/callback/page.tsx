'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { completeOidcCallback } from '@/lib/auth';

function LoginCallbackContent() {
  const [message, setMessage] = useState('Finalizing sign in...');
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function finalizeLogin() {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const providerError = searchParams.get('error');

      if (providerError) {
        setFailed(true);
        setMessage(`Login was not completed: ${providerError}`);
        return;
      }

      if (!code || !state) {
        setFailed(true);
        setMessage('Missing authorization code/state. Please start the sign-in flow again.');
        return;
      }

      try {
        await completeOidcCallback(code, state);
        setMessage('Sign in successful. Redirecting to your dashboard...');
        router.replace('/dashboard');
      } catch (error) {
        setFailed(true);
        setMessage(error instanceof Error ? error.message : 'Sign in failed during callback exchange.');
      }
    }

    void finalizeLogin();
  }, [router, searchParams]);

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ maxWidth: 680 }}>
        <h1 style={{ marginTop: 0 }}>OIDC callback</h1>
        <p className="small">{message}</p>
        {failed ? <Link className="btn btn-primary" href="/login">Back to sign in</Link> : null}
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
