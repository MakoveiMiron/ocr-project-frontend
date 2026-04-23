export default function LoginCallbackPage() {
  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ maxWidth: 680 }}>
        <h1 style={{ marginTop: 0 }}>OIDC callback</h1>
        <p className="small">
          Itt kezeld a code cserét backend oldalon (PKCE + token exchange), majd secure cookie-ba állíts sessiont.
        </p>
      </div>
    </section>
  );
}
