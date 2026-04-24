'use client';

import Link from 'next/link';
import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { clearAccessToken, hasAccessToken, startOidcLogin } from '@/lib/auth';
import { config } from '@/lib/config';

function LoginContent() {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const authenticated = hasAccessToken();

  const infoMessage = useMemo(() => {
    const reason = searchParams.get('reason');
    if (reason === 'unauthorized') {
      return 'Your session expired or is invalid. Please sign in again.';
    }

    return '';
  }, [searchParams]);

  async function handleLoginClick() {
    setMessage('');
    setIsSubmitting(true);
    try {
      await startOidcLogin();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not start login. Please try again.');
      setIsSubmitting(false);
    }
  }

  function handleSignOut() {
    clearAccessToken();
    setMessage('Signed out.');
  }

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ maxWidth: 520 }}>
        <h1 style={{ marginTop: 0 }}>Sign in</h1>
        <p className="small">
          Sign in to your account to upload PDF files, track conversion progress, and download DOCX results.
        </p>
        {infoMessage ? <p className="small">{infoMessage}</p> : null}
        {authenticated ? (
          <div className="grid" style={{ gap: 10 }}>
            <p className="small">You are authenticated in this browser session.</p>
            <div className="actions-row">
              <Link className="btn btn-primary" href="/dashboard">Go to dashboard</Link>
              <button className="btn btn-secondary" type="button" onClick={handleSignOut}>Sign out</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-primary" type="button" onClick={handleLoginClick} disabled={isSubmitting}>
            {isSubmitting ? 'Redirecting...' : `Login with ${config.oidcProviderName}`}
          </button>
        )}
        {message ? <p className="small">{message}</p> : null}
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<section className="container"><p className="small">Loading sign-in…</p></section>}>
      <LoginContent />
    </Suspense>
  );
}
