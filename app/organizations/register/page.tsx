'use client';

import { FormEvent, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

interface RegisterResponse {
  organization_id?: string;
  checkout_url?: string;
}

export default function OrganizationRegisterPage() {
  const [form, setForm] = useState({
    account_type: 'business',
    organization_name: '',
    full_name: '',
    billing_email: '',
    plan_code: 'free'
  });
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const token = await getAccessToken();
      const response = await apiFetch<RegisterResponse>(
        '/organizations/register',
        { method: 'POST', body: JSON.stringify(form) },
        token
      );
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
        return;
      }
      setMessage(`Organization created: ${response.organization_id ?? 'unknown id'}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registration failed.');
    }
  }

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 640, display: 'grid', gap: 12 }}>
        <h1 style={{ marginTop: 0 }}>Organization registration</h1>
        <p className="small">We only collect the minimum required data. Billing email is separate to protect access credentials.</p>
        <select className="select" value={form.account_type} onChange={(e) => setForm((prev) => ({ ...prev, account_type: e.target.value }))}>
          <option value="business">Business</option>
          <option value="individual">Individual</option>
        </select>
        <input className="input" required placeholder="Organization name" value={form.organization_name} onChange={(e) => setForm((prev) => ({ ...prev, organization_name: e.target.value }))} />
        <input className="input" required placeholder="Full name" value={form.full_name} onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))} />
        <input className="input" required type="email" placeholder="Billing email" value={form.billing_email} onChange={(e) => setForm((prev) => ({ ...prev, billing_email: e.target.value }))} />
        <select className="select" value={form.plan_code} onChange={(e) => setForm((prev) => ({ ...prev, plan_code: e.target.value }))}>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
        </select>
        <button className="btn btn-primary" type="submit">Start registration</button>
        {message ? <p className="small">{message}</p> : null}
      </form>
    </section>
  );
}
