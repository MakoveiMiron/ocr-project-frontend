'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
<<<<<<< codex/fix-registration-endpoint-auth-requirement-t44856
import { useRouter } from 'next/navigation';
=======
import { useRouter, useSearchParams } from 'next/navigation';
import { completeOidcCallback, consumePostLoginRedirect } from '@/lib/auth';
>>>>>>> main

function LoginCallbackContent() {
  const [message, setMessage] = useState('Finalizing sign in...');
  const router = useRouter();

  useEffect(() => {
<<<<<<< codex/fix-registration-endpoint-auth-requirement-t44856
    setMessage('OIDC callback is disabled. Redirecting to sign in...');
    const timeout = window.setTimeout(() => router.replace('/login'), 1200);
    return () => window.clearTimeout(timeout);
  }, [router]);
=======
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
        const redirectPath = consumePostLoginRedirect();
        setMessage('Sign in successful. Redirecting...');
        router.replace(redirectPath);
      } catch (error) {
        setFailed(true);
        setMessage(error instanceof Error ? error.message : 'Sign in failed during callback exchange.');
      }
    }

    void finalizeLogin();
  }, [router, searchParams]);
>>>>>>> main

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
