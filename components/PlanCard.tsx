'use client';

import { useState } from 'react';
import { Plan } from '@/lib/types';
import { createBillingCheckout } from '@/lib/api';
import { getOptionalAccessToken } from '@/lib/auth';

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
      setError(err instanceof Error ? err.message : 'Failed to start checkout.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{plan.name}</h3>
      <p style={{ fontSize: 28, margin: '10px 0 14px' }}>{plan.priceLabel}</p>
      <ul className="small">
        {plan.limits.map((limit) => <li key={limit}>{limit}</li>)}
      </ul>
      <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }} onClick={handleSelectPlan} disabled={busy}>
        {busy ? 'Loading...' : 'Choose plan'}
      </button>
      {error ? <p className="small" style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</p> : null}
    </div>
  );
}
