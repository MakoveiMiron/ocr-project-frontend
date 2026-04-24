'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserProfile, signOut } from '@/lib/auth';
import { AuthMeResponse } from '@/lib/types';

export function UserProfile() {
  const [profile, setProfile] = useState<AuthMeResponse | null>(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

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

  async function logout() {
    await signOut();
    router.replace('/login');
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 className="section-title">User profile</h2>
      {profile ? (
        <div className="small" style={{ display: 'grid', gap: 8 }}>
          <div><strong>Name:</strong> {profile.name}</div>
          <div><strong>Email:</strong> {profile.email}</div>
          <div><strong>Organization:</strong> {profile.organization_id}</div>
        </div>
      ) : <p className="small">Loading profile…</p>}
      {message ? <p className="small" style={{ color: 'var(--danger)' }}>{message}</p> : null}
      <button className="btn btn-secondary" type="button" onClick={logout}>Logout</button>
    </div>
  );
}
