'use client';

import { useEffect, useState } from 'react';
import { getCurrentUserProfile, markSessionActive } from '@/lib/auth';
import { AuthMeResponse } from '@/lib/types';

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<AuthMeResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const resolvedProfile = await getCurrentUserProfile();
        if (!mounted) return;
        markSessionActive();
        setIsAuthenticated(true);
        setProfile(resolvedProfile);
      } catch {
        if (!mounted) return;
        setIsAuthenticated(false);
        setProfile(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return { isAuthenticated, isLoading, profile };
}
