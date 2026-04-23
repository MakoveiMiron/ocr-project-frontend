export default function LoginPage() {
  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ maxWidth: 520 }}>
        <h1 style={{ marginTop: 0 }}>Belépés</h1>
        <p className="small">
          Ide kötöd be az Auth0 vagy más OIDC szolgáltató login flow-ját. Ebben a starterben
          a biztonsági elv az, hogy a tokenkezelés ne localStorage-ban történjen.
        </p>
        <button className="btn btn-primary">OIDC belépés indítása</button>
      </div>
    </section>
  );
}
