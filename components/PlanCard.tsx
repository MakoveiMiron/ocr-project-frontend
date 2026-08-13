'use client';

import { useState } from 'react';
import { Plan } from '@/lib/types';
import { createBillingCheckout } from '@/lib/api';
import { getOptionalAccessToken } from '@/lib/auth';
import { Toast } from '@/components/Toast';

export function PlanCard({ plan, isAuthenticated }: { plan: Plan; isAuthenticated: boolean }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSelectPlan() {
    if (!isAuthenticated) {
      setError('Please sign in before selecting a plan.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const token = await getOptionalAccessToken();
      const response = await createBillingCheckout(plan.code, token);
      window.location.href = response.checkout_url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start checkout.';
      if (message.toLowerCase().includes('stripe')) {
        setError('Billing is currently unavailable because Stripe is not configured on the backend environment.');
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  const isFeatured = plan.code === 'pro';

  return (
    <div className={`card plan-card${isFeatured ? ' featured' : ''}`}>
      {isFeatured ? <span className="plan-badge">Popular</span> : null}
      <h3>{plan.name}</h3>
      <p className="plan-price">{plan.priceLabel}</p>
      <ul className="feature-list">
        {plan.limits.map((limit) => <li key={limit}>{limit}</li>)}
      </ul>
      <button className={`btn btn-block${isFeatured ? ' btn-primary' : ' btn-secondary'}`} onClick={handleSelectPlan} disabled={busy}>
        {busy ? 'Loading...' : 'Choose plan'}
      </button>
      {error ? <p className="small" style={{ color: 'var(--danger)' }}>{error}</p> : null}
    </div>
  );
}
