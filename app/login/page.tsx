'use client';

import { getOidcLoginUrl } from '@/lib/auth';

export default function LoginPage() {
  const oidcUrl = getOidcLoginUrl();

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ maxWidth: 520 }}>
        <h1 style={{ marginTop: 0 }}>Belépés</h1>
        <p className="small">
          OIDC authorization code flow. Access token csak memóriában kezelt (demo: dev-token),
          így csökken a kliensoldali kiszivárgás kockázata.
        </p>
        {oidcUrl ? (
          <a className="btn btn-primary" href={oidcUrl}>OIDC belépés indítása</a>
        ) : (
          <p className="small">Állítsd be: NEXT_PUBLIC_OIDC_AUTH_URL és NEXT_PUBLIC_OIDC_CLIENT_ID.</p>
        )}
      </div>
    </section>
  );
}
