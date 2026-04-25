'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCurrentUserProfile } from '@/lib/auth';
import { AuthMeResponse } from '@/lib/types';

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
    <div className="card" style={{ marginBottom: 16, display: 'grid', gap: 16 }}>
      <h2 className="section-title" style={{ marginBottom: 0 }}>User profile</h2>
      <div className="card" style={{ margin: 0 }}>
        <h3 style={{ marginTop: 0 }}>Personal details</h3>
        {profile ? (
          <div className="small" style={{ display: 'grid', gap: 10 }}>
            <div><strong>Full name</strong><br />{profile.name}</div>
            <div><strong>Email address</strong><br />{profile.email}</div>
            <div><strong>Organization ID</strong><br />{profile.organization_id}</div>
          </div>
        ) : <p className="small" style={{ marginBottom: 0 }}>Loading profile…</p>}
      </div>

      <div className="card" style={{ margin: 0 }}>
        <h3 style={{ marginTop: 0 }}>Manage subscription</h3>
        <p className="small">
          Open billing to change plan, payment method, or renewal details.
        </p>
        <Link href="/subscription" className="btn btn-primary">Manage subscription</Link>
      </div>

      {message ? <p className="small" style={{ color: 'var(--danger)' }}>{message}</p> : null}
    </div>
  );
}
