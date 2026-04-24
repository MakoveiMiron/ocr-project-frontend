'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearAccessToken, signInWithSession } from '@/lib/auth';
import { useAuthStatus } from '@/lib/useAuthStatus';

function LoginContent() {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated: authenticated } = useAuthStatus();

  const infoMessage = useMemo(() => {
    const reason = searchParams.get('reason');
    if (reason === 'unauthorized') {
      return 'Your session expired or is invalid. Please sign in again.';
    }

    return '';
  }, [searchParams]);

  useEffect(() => {
    if (authenticated) {
      router.replace('/');
    }
  }, [authenticated, router]);

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    try {
      await signInWithSession(email, password);
      router.replace('/');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not sign in. Please try again.');
      setIsSubmitting(false);
    }
  }

  function handleSignOut() {
    clearAccessToken();
    setMessage('Signed out.');
  }

  return (
    <section className="container auth-layout" style={{ paddingBottom: 40 }}>
      <div className="card auth-card">
        <h1 style={{ marginTop: 0 }}>Sign in</h1>
        <p className="small">
          Sign in to your account to upload PDF files, track conversion progress, and download DOCX results.
        </p>
        {infoMessage ? <p className="small">{infoMessage}</p> : null}
        {authenticated ? (
          <div className="grid" style={{ gap: 10 }}>
            <p className="small">You are authenticated in this browser session.</p>
            <div className="actions-row">
              <Link className="btn btn-primary" href="/">Go to app</Link>
              <button className="btn btn-secondary" type="button" onClick={handleSignOut}>Sign out</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLoginSubmit} className="grid" style={{ gap: 10 }}>
            <label className="small" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <label className="small" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
            <p className="small" style={{ marginBottom: 0 }}>
              Don&apos;t have an account? <Link href="/register">Create one</Link>
            </p>
          </form>
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
