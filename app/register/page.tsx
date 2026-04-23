'use client';

import { FormEvent, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

interface RegisterResponse {
  organization_id?: string;
  checkout_url?: string;
}

type AccountType = 'individual' | 'company';
type PlanCode = 'free' | 'pro' | 'enterprise';

export default function RegisterPage() {
  const [form, setForm] = useState({
    account_type: 'individual' as AccountType,
    organization_name: '',
    full_name: '',
    billing_email: '',
    password: '',
    plan_code: 'free' as PlanCode
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsCompanyName = useMemo(() => form.account_type === 'company', [form.account_type]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const token = await getAccessToken();
      const payload = {
        account_type: form.account_type,
        organization_name: needsCompanyName ? form.organization_name : form.full_name,
        full_name: form.full_name,
        billing_email: form.billing_email,
        plan_code: form.plan_code
      };

      const response = await apiFetch<RegisterResponse>(
        '/organizations/register',
        { method: 'POST', body: JSON.stringify(payload) },
        token
      );

      if (response.checkout_url) {
        window.location.href = response.checkout_url;
        return;
      }

      setMessage('Registration completed. You can now sign in and convert PDF files.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="container" style={{ paddingBottom: 40 }}>
      <form className="card" onSubmit={handleSubmit} style={{ maxWidth: 640, display: 'grid', gap: 12 }}>
        <h1 style={{ marginTop: 0 }}>Create your account</h1>
        <p className="small">Choose your account type and plan to start converting PDF files to DOCX.</p>

        <label className="small">Account type</label>
        <select
          className="select"
          value={form.account_type}
          onChange={(e) => setForm((prev) => ({ ...prev, account_type: e.target.value as AccountType }))}
        >
          <option value="individual">Individual</option>
          <option value="company">Company</option>
        </select>

        {needsCompanyName ? (
          <>
            <label className="small">Company name</label>
            <input
              className="input"
              required
              placeholder="Your company name"
              value={form.organization_name}
              onChange={(e) => setForm((prev) => ({ ...prev, organization_name: e.target.value }))}
            />
          </>
        ) : null}

        <label className="small">Full name</label>
        <input
          className="input"
          required
          placeholder="Your full name"
          value={form.full_name}
          onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
        />

        <label className="small">Email</label>
        <input
          className="input"
          required
          type="email"
          placeholder="you@example.com"
          value={form.billing_email}
          onChange={(e) => setForm((prev) => ({ ...prev, billing_email: e.target.value }))}
        />

        <label className="small">Password</label>
        <input
          className="input"
          required
          type="password"
          placeholder="Create a password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        />

        <label className="small">Plan</label>
        <select
          className="select"
          value={form.plan_code}
          onChange={(e) => setForm((prev) => ({ ...prev, plan_code: e.target.value as PlanCode }))}
        >
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
        {message ? <p className="small">{message}</p> : null}
      </form>
    </section>
  );
}
