export default function BillingSuccessPage() {
  return (
    <section className="container">
      <div className="card">
        <h1 style={{ marginTop: 0 }}>Subscription successful</h1>
        <p className="small">The backend updates entitlements and plan limits based on webhook events.</p>
      </div>
    </section>
  );
}
