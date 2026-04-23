'use client';

import { useState } from 'react';
import { PlanCard } from '@/components/PlanCard';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { Plan } from '@/lib/types';

const plans: Plan[] = [
  {
    code: 'free',
    name: 'Free',
    priceLabel: '€0 / month',
    limits: ['50 pages / month', '10 MB file size', 'Document AI basic routing']
  },
  {
    code: 'starter',
    name: 'Starter',
    priceLabel: '€49 / month',
    limits: ['1,000 pages / month', '50 MB file size', 'Includes Textract support']
  },
  {
    code: 'pro',
    name: 'Pro',
    priceLabel: '€199 / month',
    limits: ['10,000 pages / month', '200 MB file size', 'Priority processing']
  }
];

interface BillingPortalResponse {
  portal_url: string;
}

export default function PricingPage() {
  const [message, setMessage] = useState('');

  async function openPortal() {
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
        <h1 style={{ marginTop: 0 }}>Subscription plans</h1>
        <p className="small">Backend entitlements control access and plan limits.</p>
        <button className="btn btn-secondary" onClick={openPortal}>Open Stripe billing portal</button>
        {message ? <p className="small" style={{ color: 'var(--danger)' }}>{message}</p> : null}
      </div>
      <div className="grid grid-3">
        {plans.map((plan) => <PlanCard key={plan.code} plan={plan} />)}
      </div>
    </section>
  );
}
