'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { clearAccessToken, getOidcLoginUrl, hasAccessToken, setAccessToken } from '@/lib/auth';

export default function LoginPage() {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [authenticated, setAuthenticated] = useState(hasAccessToken());
  const oidcUrl = getOidcLoginUrl();

  function handleManualTokenSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) {
      setMessage('Please paste an access token.');
      return;
    }

    setAccessToken(trimmed);
    setAuthenticated(true);
    setToken('');
    setMessage('Signed in. You can now upload and convert files.');
  }

  function handleSignOut() {
    clearAccessToken();
    setAuthenticated(false);
    setMessage('Signed out.');
  }

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ maxWidth: 520 }}>
        <h1 style={{ marginTop: 0 }}>Sign in</h1>
        <p className="small">
          Sign in to your account to upload PDF files, track conversion progress, and download DOCX results.
        </p>
        {authenticated ? (
          <div className="grid" style={{ gap: 10 }}>
            <p className="small">You are authenticated in this browser session.</p>
            <div className="actions-row">
              <Link className="btn btn-primary" href="/">Go to converter</Link>
              <button className="btn btn-secondary" type="button" onClick={handleSignOut}>Sign out</button>
            </div>
          </div>
        ) : null}
        {oidcUrl ? (
          <a className="btn btn-primary" href={oidcUrl}>Continue to sign in</a>
        ) : (
          <p className="small">Set NEXT_PUBLIC_OIDC_AUTH_URL and NEXT_PUBLIC_OIDC_CLIENT_ID.</p>
        )}
        {!authenticated ? (
          <form onSubmit={handleManualTokenSubmit} style={{ marginTop: 16, display: 'grid', gap: 8 }}>
            <label className="small" htmlFor="access-token">Access token (JWT)</label>
            <textarea
              id="access-token"
              className="input"
              placeholder="Paste Bearer token from your auth provider"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              rows={5}
            />
            <button className="btn btn-secondary" type="submit">Use this token</button>
          </form>
        ) : null}
        {message ? <p className="small">{message}</p> : null}
      </div>
    </section>
  );
}
