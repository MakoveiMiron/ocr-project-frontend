'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUserProfile } from '@/lib/auth';
import { AuthMeResponse } from '@/lib/types';
import { Toast } from '@/components/Toast';

export function UserProfile() {
  const [profile, setProfile] = useState<AuthMeResponse | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const me = await getCurrentUserProfile();
        setProfile(me);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Failed to load user profile.');
      }
    }

    void loadProfile();
  }, []);

  return (
    <>
      <Toast message={message} tone={message ? (message.toLowerCase().includes('fail') || message.toLowerCase().includes('error') ? 'error' : 'info') : 'info'} onClose={() => setMessage('')} />
    <div className="grid grid-2">

      <div className="card">
        <h3>Personal details</h3>
        {profile ? (
          <dl className="stat-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="stat-cell">
              <dt>Full name</dt>
              <dd>{profile.name}</dd>
            </div>
            <div className="stat-cell">
              <dt>Email address</dt>
              <dd>{profile.email}</dd>
            </div>
            <div className="stat-cell">
              <dt>Organization ID</dt>
              <dd>{profile.organization_id}</dd>
            </div>
          </dl>
        ) : <p className="small muted">Loading profile…</p>}
      </div>

      <div className="card">
        <h3>Manage subscription</h3>
        <p className="small muted">
          Open billing to change plan, payment method, or renewal details.
        </p>
        <Link href="/subscription" className="btn btn-primary">Manage subscription</Link>
      </div>

      {message ? <p className="small" style={{ color: 'var(--danger)' }}>{message}</p> : null}
    </div>
    </>
  );
}
