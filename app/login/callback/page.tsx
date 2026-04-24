'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { setAccessToken } from '@/lib/auth';

export default function LoginCallbackPage() {
  const [message, setMessage] = useState('Finalizing sign in...');

  useEffect(() => {
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get('access_token');
    if (!accessToken) {
      setMessage('No access token found in callback URL. Complete token exchange on the backend.');
      return;
    }

    setAccessToken(accessToken);
    setMessage('Sign in completed. You can return to the converter.');
  }, []);

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ maxWidth: 680 }}>
        <h1 style={{ marginTop: 0 }}>OIDC callback</h1>
        <p className="small">{message}</p>
        <Link className="btn btn-primary" href="/">Go to converter</Link>
      </div>
    </section>
  );
}
