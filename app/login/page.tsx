'use client';

import { getOidcLoginUrl } from '@/lib/auth';

export default function LoginPage() {
  const oidcUrl = getOidcLoginUrl();

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ maxWidth: 520 }}>
        <h1 style={{ marginTop: 0 }}>Sign in</h1>
        <p className="small">
          Sign in to your account to upload PDF files, track conversion progress, and download DOCX results.
        </p>
        {oidcUrl ? (
          <a className="btn btn-primary" href={oidcUrl}>Continue to sign in</a>
        ) : (
          <p className="small">Set NEXT_PUBLIC_OIDC_AUTH_URL and NEXT_PUBLIC_OIDC_CLIENT_ID.</p>
        )}
      </div>
    </section>
  );
}
