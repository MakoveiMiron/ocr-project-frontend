'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { registerAndSignIn } from '@/lib/auth';
import { AccountType, PlanCode } from '@/lib/types';
import { Toast } from '@/components/Toast';

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
    <>
      <Toast message={message} tone={message ? (message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') ? 'error' : 'info') : 'info'} onClose={() => setMessage('')} />
    <section className="container auth-layout">
      <form className="card auth-card stack" onSubmit={handleSubmit}>
        <div className="auth-header">
          <span className="auth-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="7.2" r="3.2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3.8 17c0.9-3.1 3.4-4.8 6.2-4.8s5.3 1.7 6.2 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <h1>Create your account</h1>
          <p className="small muted">
            Public registration is enabled. Create your account. You will be signed in automatically.
          </p>
        </div>

        <div className="field">
          <label className="field-label">Account type</label>
          <select
            className="select"
            value={form.account_type}
            onChange={(e) => setForm((prev) => ({ ...prev, account_type: e.target.value as AccountType }))}
          >
            <option value="individual">Individual</option>
            <option value="company">Company</option>
          </select>
        </div>

        {needsCompanyName ? (
          <div className="field">
            <label className="field-label">Company name</label>
            <input
              className="input"
              required
              placeholder="Your company name"
              value={form.organization_name}
              onChange={(e) => setForm((prev) => ({ ...prev, organization_name: e.target.value }))}
            />
          </div>
        ) : null}

        <div className="field">
          <label className="field-label">Full name</label>
          <input
            className="input"
            required
            autoComplete="name"
            placeholder="Your full name"
            value={form.full_name}
            onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
          />
        </div>

        <div className="field">
          <label className="field-label">Billing email</label>
          <input
            className="input"
            required
            type="email"
            autoComplete="email"
            placeholder="billing@example.com"
            value={form.billing_email}
            onChange={(e) => setForm((prev) => ({ ...prev, billing_email: e.target.value }))}
          />
        </div>

        <div className="field">
          <label className="field-label">Login email</label>
          <input
            className="input"
            required
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div className="field">
          <label className="field-label">Password</label>
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
        </div>

        <div className="field">
          <label className="field-label">Plan</label>
          <select
            className="select"
            value={form.plan_code}
            onChange={(e) => setForm((prev) => ({ ...prev, plan_code: e.target.value as PlanCode }))}
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
        <p className="small form-footer-note">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
        {message ? <p className="small form-footer-note">{message}</p> : null}
      </form>
    </section>
    </>
  );
}
