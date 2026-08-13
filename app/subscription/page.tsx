'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlanCard } from '@/components/PlanCard';
import { createBillingPortal } from '@/lib/api';
import { getOptionalAccessToken } from '@/lib/auth';
import { useAuthStatus } from '@/lib/useAuthStatus';
import { Toast } from '@/components/Toast';
import { Plan } from '@/lib/types';

const plans: Plan[] = [
  {
    code: 'free',
    name: 'Free',
    priceLabel: '€0 / month',
    limits: ['50 pages / month', '10 MB file size', 'Standard processing']
  },
  {
    code: 'pro',
    name: 'Pro',
    priceLabel: '€49 / month',
    limits: ['1,000 pages / month', '50 MB file size', 'Priority processing']
  },
  {
    code: 'enterprise',
    name: 'Enterprise',
    priceLabel: 'Custom',
    limits: ['High-volume processing', 'Larger file limits', 'Priority support']
  }
];

export default function SubscriptionPage() {
  const [message, setMessage] = useState('');
  const { isAuthenticated, isLoading } = useAuthStatus();

  async function openPortal() {
    if (!isAuthenticated) {
      setMessage('Please sign in before opening the billing portal.');
      return;
    }

    try {
      const token = await getOptionalAccessToken();
      const response = await createBillingPortal(token);
      window.location.href = response.portal_url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to open billing portal.';
      if (message.toLowerCase().includes('stripe')) {
        setMessage('Billing portal is unavailable because Stripe is not configured on the backend.');
      } else {
        setMessage(message);
      }
    }
  }

  return (
    <>
      <Toast message={message} tone={message ? (message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') ? 'error' : 'info') : 'info'} onClose={() => setMessage('')} />
    <section className="container page">
      <header className="page-header">
        <p className="eyebrow">Billing</p>
        <h1>Manage subscription</h1>
        <p className="small muted" style={{ maxWidth: 640 }}>
          Choose a plan and continue to Stripe checkout. Subscription renewals/resubscriptions are handled on the backend
          via Stripe webhooks; this frontend only initiates checkout and opens the billing portal.
        </p>
      </header>
      <div className="card" style={{ marginBottom: 20 }}>
        {isLoading ? <p className="small processing-indicator" style={{ marginBottom: 12 }}><span className="spinner" />Checking session...</p> : null}
        {!isAuthenticated && !isLoading ? <p className="small" style={{ color: 'var(--danger)' }}>Sign in is required for billing actions.</p> : null}
        <div className="actions-row">
          <button className="btn btn-secondary" onClick={openPortal}>Open billing portal</button>
          {!isAuthenticated ? <Link href="/login" className="btn btn-primary">Sign in</Link> : null}
        </div>
        {message ? <p className="small" style={{ color: 'var(--danger)', marginTop: 10, marginBottom: 0 }}>{message}</p> : null}
      </div>
      <div className="grid grid-3">
        {plans.map((plan) => <PlanCard key={plan.code} plan={plan} isAuthenticated={isAuthenticated} />)}
      </div>
    </section>
    </>
  );
}
