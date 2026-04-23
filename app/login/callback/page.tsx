export default function LoginCallbackPage() {
  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ maxWidth: 680 }}>
        <h1 style={{ marginTop: 0 }}>OIDC callback</h1>
        <p className="small">
          Handle code exchange on the backend here (PKCE + token exchange), then set a secure
          cookie-based session.
        </p>
      </div>
    </section>
  );
}
