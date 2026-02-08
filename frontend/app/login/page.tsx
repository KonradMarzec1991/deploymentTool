'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CButton, CCard, CCardBody, CCardHeader, CCol, CContainer, CRow } from '@coreui/react';
import { setAuthToken, getAuthToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token'), [searchParams]);

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

  return (
    <main>
      <CContainer className="py-5">
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCard className="card-surface">
              <CCardHeader>Sign in</CCardHeader>
              <CCardBody>
                <div className="text-body-secondary mb-3">
                  Authorize to manage deployments.
                </div>
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
