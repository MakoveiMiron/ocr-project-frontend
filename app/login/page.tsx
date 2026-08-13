'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithSession, signOut, startOidcLogin } from '@/lib/auth';
import { config } from '@/lib/config';
import { useAuthStatus } from '@/lib/useAuthStatus';
import { Toast } from '@/components/Toast';

function LoginContent() {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated: authenticated } = useAuthStatus();
  const nextPath = useMemo(() => searchParams.get('next') || '/', [searchParams]);

  const infoMessage = useMemo(() => {
    const reason = searchParams.get('reason');
    if (reason === 'unauthorized') {
      return 'Your session expired or is invalid. Please sign in again.';
    }

    return '';
  }, [searchParams]);

  useEffect(() => {
    if (authenticated) {
      router.replace(nextPath);
    }
  }, [authenticated, nextPath, router]);

  async function handleLoginSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    try {
      await signInWithSession(email, password);
      router.replace(nextPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    setMessage('Signed out.');
  }

  async function handleOidcLogin() {
    setMessage('');
    try {
      await startOidcLogin(nextPath);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'OIDC sign in could not be started.');
    }
  }

  return (
    <>
      <Toast message={message} tone={message ? (message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') ? 'error' : 'info') : 'info'} onClose={() => setMessage('')} />
    <section className="container auth-layout">
      <div className="card auth-card">
        <div className="auth-header">
          <span className="auth-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="4" y="9" width="12" height="8" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <h1>Sign in</h1>
          <p className="small muted">
            Sign in to your account to upload PDF files, track conversion progress, and download DOCX results.
          </p>
        </div>
        {infoMessage ? <p className="small">{infoMessage}</p> : null}
        {authenticated ? (
          <div className="stack">
            <p className="small">You are authenticated in this browser session.</p>
            <div className="actions-row">
              <Link className="btn btn-primary" href={nextPath}>Continue</Link>
              <button className="btn btn-secondary" type="button" onClick={handleSignOut}>Sign out</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleLoginSubmit} className="stack">
            <div className="field">
              <label className="field-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
            {config.oidcEnabled ? (
              <button className="btn btn-secondary btn-block" type="button" onClick={handleOidcLogin}>
                Sign in with {config.oidcProviderName}
              </button>
            ) : null}
            <p className="small form-footer-note">
              Don&apos;t have an account? <Link href="/register">Create one</Link>
            </p>
          </form>
        )}
        {message ? <p className="small" style={{ marginTop: 4 }}>{message}</p> : null}
      </div>
    </section>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<section className="container page"><p className="small muted">Loading sign-in…</p></section>}>
      <LoginContent />
    </Suspense>
  );
}
