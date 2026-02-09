'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
} from '@coreui/react';
import { api } from '@/lib/api';
import { clearAuthToken, getAuthToken } from '@/lib/auth';
import { ErrorState, LoadingState } from '@/components';

type UserProfile = {
  id: number;
  provider: string;
  provider_login: string;
  provider_id?: string | null;
  email?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    let isMounted = true;
    async function loadProfile() {
      try {
        const res = await api.get('/auth/me');
        if (!isMounted) return;
        setProfile(res.data);
      } catch (err: any) {
        if (!isMounted) return;
        setLoadError(err?.response?.data?.detail ?? err?.message ?? 'Failed to load profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);
    setChanging(true);

    try {
      await api.post('/auth/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setChangeSuccess('Password updated.');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((item: any) => item?.msg ?? JSON.stringify(item)).join(', ')
            : detail?.msg ?? err?.message ?? 'Password update failed';
      setChangeError(message);
    } finally {
      setChanging(false);
    }
  }

  if (loading) return <LoadingState />;
  if (loadError) return <ErrorState message={loadError} />;
  if (!profile) return <ErrorState message="Profile not available." />;

  const canChangePassword = profile.provider === 'local';

  return (
    <main>
      <CContainer className="py-4">
        <CRow className="g-4">
          <CCol lg={5}>
            <CCard className="card-surface">
              <CCardHeader>Profile</CCardHeader>
              <CCardBody>
                <div className="mb-2">
                  <div className="text-body-secondary">Username</div>
                  <div>{profile.provider_login}</div>
                </div>
                {profile.email && (
                  <div className="mb-2">
                    <div className="text-body-secondary">Email</div>
                    <div>{profile.email}</div>
                  </div>
                )}
                <div className="mb-2">
                  <div className="text-body-secondary">Role</div>
                  <div>{profile.role}</div>
                </div>
                <div className="mb-2">
                  <div className="text-body-secondary">Provider</div>
                  <div>{profile.provider}</div>
                </div>
                <div className="mb-3">
                  <div className="text-body-secondary">Status</div>
                  <div>{profile.is_active ? 'Active' : 'Inactive'}</div>
                </div>
                <CButton
                  color="dark"
                  variant="outline"
                  onClick={() => {
                    clearAuthToken();
                    router.replace('/login');
                  }}
                >
                  Sign out
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol lg={7}>
            <CCard className="card-surface">
              <CCardHeader>Change password</CCardHeader>
              <CCardBody>
                {!canChangePassword && (
                  <CAlert color="info" className="mb-3">
                    Password change is available only for local accounts.
                  </CAlert>
                )}
                {changeError && (
                  <CAlert color="danger" className="mb-3">
                    {changeError}
                  </CAlert>
                )}
                {changeSuccess && (
                  <CAlert color="success" className="mb-3">
                    {changeSuccess}
                  </CAlert>
                )}
                <CForm onSubmit={handleChangePassword}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="currentPassword">Current password</CFormLabel>
                    <CFormInput
                      id="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required={canChangePassword}
                      disabled={!canChangePassword}
                    />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="newPassword">New password</CFormLabel>
                    <CFormInput
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={8}
                      required={canChangePassword}
                      disabled={!canChangePassword}
                    />
                  </div>
                  <CButton color="primary" type="submit" disabled={!canChangePassword || changing}>
                    {changing ? 'Updating…' : 'Update password'}
                  </CButton>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </main>
  );
}
