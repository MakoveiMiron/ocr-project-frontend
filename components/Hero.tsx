'use client';
import Link from 'next/link';
import { useAuthStatus } from '@/lib/useAuthStatus';

const FEATURES = ['Accurate OCR workflow', 'Editable DOCX output', 'Secure account-based history'];

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Hero() {
  const { isAuthenticated, isLoading } = useAuthStatus();

  return (
    <section className="hero container">
      <div className="hero-copy">
        <p className="eyebrow">OCR document conversion</p>
        <h1>
          Convert PDFs into <span className="text-gradient">editable DOCX</span> without the clutter
        </h1>
        <p className="muted hero-lede">
          Built for reliable OCR throughput with clean outputs, transparent status tracking, and account-level file
          history.
        </p>
        {!isAuthenticated && !isLoading ? (
          <div className="actions-row">
            <Link className="btn btn-primary" href="/register">
              Start free
            </Link>
            <Link className="btn btn-secondary" href="/login">
              Sign in
            </Link>
          </div>
        ) : null}
      </div>
      <div className="hero-features">
        {FEATURES.map((feature) => (
          <div className="feature-check" key={feature}>
            <span className="feature-check-icon">
              <CheckIcon />
            </span>
            {feature}
          </div>
        ))}
      </div>
    </section>
  );
}
