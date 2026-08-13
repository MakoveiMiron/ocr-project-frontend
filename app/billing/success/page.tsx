import Link from 'next/link';

export default function BillingSuccessPage() {
  return (
    <section className="container page">
      <div className="card auth-card stack">
        <span className="icon-tile icon-tile-success" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6.5 10.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="eyebrow">Billing</p>
        <h1 style={{ margin: 0 }}>Subscription successful</h1>
        <p className="muted">Your subscription is now active and billing updates are syncing in the background.</p>
        <div className="actions-row">
          <Link href="/dashboard" className="btn btn-primary">Go to dashboard</Link>
          <Link href="/subscription" className="btn btn-secondary">View plans</Link>
        </div>
      </div>
    </section>
  );
}
