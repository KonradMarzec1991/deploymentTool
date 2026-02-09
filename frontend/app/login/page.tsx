'use client';

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { getAuthToken, setAuthToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token'), [searchParams]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getAuthToken();
    if (existing) {
      router.replace('/');
      return;
    }
    if (token) {
      setAuthToken(token);
      router.replace('/');
    }
  }, [router, token]);

  async function handleLocalLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.post('/auth/login', { username, password });
      const accessToken = res.data?.access_token;
      if (!accessToken) {
        throw new Error('Missing access token');
      }
      setAuthToken(accessToken);
      router.replace('/');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((item) => item?.msg ?? JSON.stringify(item)).join(', ')
            : detail?.msg ?? err?.message ?? 'Login failed';

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <CContainer className="py-5">
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCard className="card-surface">
              <CCardHeader>Log in</CCardHeader>
              <CCardBody>
                <div className="text-body-secondary mb-3">
                  Authorize to manage deployments.
                </div>
                {error && (
                  <CAlert
                    color="danger"
                    className="mb-3"
                    dismissible
                    onClose={() => setError(null)}
                  >
                    {error}
                  </CAlert>
                )}
                <CForm onSubmit={handleLocalLogin} className="mb-3">
                  <div className="mb-3">
                    <CFormLabel htmlFor="username">Username</CFormLabel>
                    <CFormInput
                      id="username"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <CFormLabel htmlFor="password">Password</CFormLabel>
                    <CFormInput
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <CButton color="primary" className="w-100" type="submit" disabled={submitting}>
                    {submitting ? 'Logging in…' : 'Log in'}
                  </CButton>
                </CForm>
                <CButton
                  color="dark"
                  className="w-100 mb-2"
                  onClick={() => {
                    if (!API_URL) return;
                    window.location.href = `${API_URL}/auth/github/login`;
                  }}
                >
                  Continue with GitHub
                </CButton>
                <CButton color="light" className="w-100" disabled>
                  Continue with Google (coming soon)
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </main>
  );
}
