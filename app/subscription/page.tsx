'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlanCard } from '@/components/PlanCard';
import { apiFetch } from '@/lib/api';
import { getAccessToken, hasAccessToken } from '@/lib/auth';
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

interface BillingPortalResponse {
  portal_url: string;
}

export default function SubscriptionPage() {
  const [message, setMessage] = useState('');
  const [isAuthenticated] = useState(hasAccessToken());

  async function openPortal() {
    if (!isAuthenticated) {
      setMessage('Please sign in before opening the billing portal.');
      return;
    }

    try {
      const token = await getAccessToken();
      const response = await apiFetch<BillingPortalResponse>('/billing/portal', { method: 'POST' }, token);
      window.location.href = response.portal_url;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to open billing portal.');
    }
  }

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ marginTop: 0 }}>Manage subscription</h1>
        <p className="small">
          Choose a plan and continue to Stripe checkout. Subscription renewals/resubscriptions are handled on the backend
          via Stripe webhooks; this frontend only initiates checkout and opens the billing portal.
        </p>
        {!isAuthenticated ? <p className="small" style={{ color: 'var(--danger)' }}>Sign in is required for billing actions.</p> : null}
        <button className="btn btn-secondary" onClick={openPortal}>Open billing portal</button>
        {!isAuthenticated ? <Link href="/login" className="btn btn-primary" style={{ marginLeft: 8 }}>Sign in</Link> : null}
        {message ? <p className="small" style={{ color: 'var(--danger)' }}>{message}</p> : null}
      </div>
      <div className="grid grid-3">
        {plans.map((plan) => <PlanCard key={plan.code} plan={plan} isAuthenticated={isAuthenticated} />)}
      </div>
    </section>
  );
}
