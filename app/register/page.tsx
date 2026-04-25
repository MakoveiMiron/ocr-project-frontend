'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { registerAndSignIn } from '@/lib/auth';
import { AccountType, PlanCode } from '@/lib/types';

export default function RegisterPage() {
  const [form, setForm] = useState({
    account_type: 'individual' as AccountType,
    organization_name: '',
    full_name: '',
    billing_email: '',
    email: '',
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

    let didRedirect = false;
    try {
      const payload = {
        account_type: form.account_type,
        organization_name: needsCompanyName ? form.organization_name : null,
        full_name: form.full_name,
        billing_email: form.billing_email,
        email: form.email,
        password: form.password,
        plan_code: form.plan_code
      };

      const response = await registerAndSignIn(payload);

      if (response.checkout_url) {
        didRedirect = true;
        window.location.href = response.checkout_url;
        return;
      }

      didRedirect = true;
      window.location.href = '/dashboard';
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : 'Registration failed.';
      if (rawMessage.includes('409')) {
        setMessage('This email is already registered. Please sign in.');
      } else {
        setMessage(rawMessage);
      }
    } finally {
      if (!didRedirect) {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <section className="container auth-layout" style={{ paddingBottom: 40 }}>
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1 style={{ marginTop: 0, textAlign: 'center' }}>Create your account</h1>
        <p className="small" style={{ textAlign: 'center' }}>
          Public registration is enabled. Create your account. You will be signed in automatically.
        </p>

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
          autoComplete="name"
          placeholder="Your full name"
          value={form.full_name}
          onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
        />

        <label className="small">Billing email</label>
        <input
          className="input"
          required
          type="email"
          autoComplete="email"
          placeholder="billing@example.com"
          value={form.billing_email}
          onChange={(e) => setForm((prev) => ({ ...prev, billing_email: e.target.value }))}
        />

        <label className="small">Login email</label>
        <input
          className="input"
          required
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        />

        <label className="small">Password</label>
        <input
          className="input"
          required
          minLength={8}
          type="password"
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
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
        <p className="small" style={{ marginBottom: 0, textAlign: 'center' }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
        {message ? <p className="small" style={{ textAlign: 'center' }}>{message}</p> : null}
      </form>
    </section>
  );
}
