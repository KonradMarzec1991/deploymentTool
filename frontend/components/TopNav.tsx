'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { clearAuthToken, getAuthToken } from '@/lib/auth';

type UserProfile = {
  provider_login: string;
  role: string;
  provider: string;
};

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function loadProfile() {
      try {
        const res = await api.get('/auth/me');
        if (!isMounted) return;
        setProfile(res.data);
      } catch {
        if (!isMounted) return;
        clearAuthToken();
        setProfile(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const isHome = pathname === '/';
  const isAccount = pathname === '/account';

  return (
    <div className="top-nav">
      <div className="container top-nav-inner">
        <button
          className="top-nav-brand"
          onClick={() => router.push('/')}
          aria-current={isHome ? 'page' : undefined}
        >
          Deployment Tool
        </button>

        <div className="top-nav-links">
          <button
            className={`top-nav-link ${isHome ? 'is-active' : ''}`}
            onClick={() => router.push('/')}
          >
            Home
          </button>
          <button
            className={`top-nav-link ${isAccount ? 'is-active' : ''}`}
            onClick={() => router.push('/account')}
          >
            Profile
          </button>
        </div>

        <div className="top-nav-actions">
          {loading ? (
            <span className="top-nav-muted">Loading…</span>
          ) : profile ? (
            <>
              <span className="top-nav-user">
                {profile.provider_login} · {profile.role}
              </span>
              <button
                className="top-nav-link"
                onClick={() => {
                  clearAuthToken();
                  router.replace('/login');
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <button className="top-nav-link" onClick={() => router.push('/login')}>
              Log in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
