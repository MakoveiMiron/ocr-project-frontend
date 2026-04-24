'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearAccessToken, getCurrentUserProfile, hasAccessToken } from '@/lib/auth';

export function NavAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const isAuthenticated = hasAccessToken();
    setAuthenticated(isAuthenticated);

    if (!isAuthenticated) {
      setName('');
      return;
    }

    void getCurrentUserProfile()
      .then((profile) => setName(profile.name || profile.email))
      .catch(() => setName(''));
  }, []);

  function onLogout() {
    clearAccessToken();
    setAuthenticated(false);
    setName('');
    window.location.href = '/login';
  }

  if (!authenticated) {
    return (
      <>
        <Link href="/login" className="btn btn-secondary">Sign in</Link>
        <Link href="/register" className="btn btn-primary">Register</Link>
      </>
    );
  }

  return (
    <>
      <Link href="/dashboard" className="btn btn-secondary">Dashboard</Link>
      {name ? <span className="small">{name}</span> : null}
      <button type="button" className="btn btn-primary" onClick={onLogout}>Logout</button>
    </>
  );
}
