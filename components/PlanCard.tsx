'use client';

import { useState } from 'react';
import { Plan } from '@/lib/types';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

interface CheckoutResponse {
  checkout_url: string;
}

export function PlanCard({ plan }: { plan: Plan }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSelectPlan() {
    setBusy(true);
    setError('');
    try {
      const token = await getAccessToken();
      const response = await apiFetch<CheckoutResponse>(`/billing/checkout/${plan.code}`, { method: 'POST' }, token);
      window.location.href = response.checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout indítása sikertelen.');
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
        {busy ? 'Betöltés...' : 'Választom'}
      </button>
      {error ? <p className="small" style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</p> : null}
    </div>
  );
}
