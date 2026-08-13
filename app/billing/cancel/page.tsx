import Link from 'next/link';

export default function BillingCancelPage() {
  return (
    <section className="container page">
      <div className="card auth-card stack">
        <span className="icon-tile icon-tile-danger" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M7.3 7.3l5.4 5.4M12.7 7.3l-5.4 5.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <p className="eyebrow">Billing</p>
        <h1 style={{ margin: 0 }}>Payment canceled</h1>
        <p className="muted">No charge was made. You can return anytime and choose a plan.</p>
        <div className="actions-row">
          <Link href="/subscription" className="btn btn-primary">Back to subscription</Link>
        </div>
      </div>
    </section>
  );
}
