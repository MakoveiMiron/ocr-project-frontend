import Link from 'next/link';

export function Hero() {
  return (
    <section className="hero container">
      <div className="badge">Primary focus: data security</div>
      <h1>Secure PDF → DOCX platform with registration and subscription support</h1>
      <p>
        Structural analysis, smart OCR routing, and Word reconstruction in a multi-tenant,
        subscription-based system.
      </p>
      <div className="actions-row mt-16">
        <Link className="btn btn-primary" href="/dashboard">Open dashboard</Link>
        <Link className="btn btn-secondary" href="/pricing">View plans</Link>
      </div>
    </section>
  );
}
