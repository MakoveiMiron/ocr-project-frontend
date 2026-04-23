'use client';

import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export default function WebhooksAdminPage() {
  const [payload, setPayload] = useState('{"type":"customer.subscription.updated"}');
  const [signature, setSignature] = useState('');
  const [result, setResult] = useState('');

  async function sendTestWebhook(event: FormEvent) {
    event.preventDefault();
    try {
      const token = await getAccessToken();
      await apiFetch('/webhooks/stripe', {
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
          ...(signature ? { 'stripe-signature': signature } : {})
        }
      }, token);
      setResult('Webhook sent successfully.');
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'Webhook test failed.');
    }
  }

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <h1 style={{ marginTop: 0 }}>Stripe webhook admin</h1>
        <p className="small">Always verify webhook signatures and log entitlement changes.</p>
      </div>
      <form className="card" onSubmit={sendTestWebhook} style={{ display: 'grid', gap: 10 }}>
        <label className="small">Stripe-Signature (optional for testing)</label>
        <input className="input" value={signature} onChange={(e) => setSignature(e.target.value)} />
        <label className="small">Payload</label>
        <textarea className="input" rows={8} value={payload} onChange={(e) => setPayload(e.target.value)} />
        <button className="btn btn-primary" type="submit">Send test webhook</button>
        {result ? <p className="small">{result}</p> : null}
      </form>
    </section>
  );
}
