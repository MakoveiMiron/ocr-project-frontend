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
    priceLabel: '0 € / hó',
    limits: ['50 oldal / hó', '10 MB fájlméret', 'Document AI alap routing']
  },
  {
    code: 'starter',
    name: 'Starter',
    priceLabel: '49 € / hó',
    limits: ['1 000 oldal / hó', '50 MB fájlméret', 'Textract használat is']
  },
  {
    code: 'pro',
    name: 'Pro',
    priceLabel: '199 € / hó',
    limits: ['10 000 oldal / hó', '200 MB fájlméret', 'prioritásos feldolgozás']
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
      setMessage(error instanceof Error ? error.message : 'Portal megnyitása sikertelen.');
    }
  }

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ marginTop: 0 }}>Előfizetési csomagok</h1>
        <p className="small">A backend entitlement alapon kezeli a hozzáférést és a limiteket.</p>
        <button className="btn btn-secondary" onClick={openPortal}>Stripe billing portal</button>
        {message ? <p className="small" style={{ color: 'var(--danger)' }}>{message}</p> : null}
      </div>
      <div className="grid grid-3">
        {plans.map((plan) => <PlanCard key={plan.code} plan={plan} />)}
      </div>
    </section>
  );
}
