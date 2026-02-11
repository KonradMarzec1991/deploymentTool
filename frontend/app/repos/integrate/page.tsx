'use client';

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

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';


const Form = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [repositoryName, setRepositoryName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const trimmed = repositoryName.trim();
      const token = getAuthToken();
      await api.post('/repos/integrate', { name: trimmed }, { headers: { Authorization: `Bearer ${token}`}});

      setSuccess(`Repository ${trimmed} found for your account.`);
      setRepositoryName('');
      setTimeout(() => router.push('/'), 1000);

    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((item) => item?.msg ?? JSON.stringify(item)).join(', ')
            : detail?.msg ?? err?.message ?? 'Integration failed';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CForm onSubmit={handleSubmit} className="mb-3">
      <div className="text-body-secondary mb-3">Integrate github repository</div>
      {error && (
        <CAlert color="danger" className="mb-3" dismissible onClose={() => setError(null)}>
          {error}
        </CAlert>
      )}
      {success && (
        <CAlert color="success" className="mb-3" dismissible onClose={() => setSuccess(null)}>
          {success}
        </CAlert>
      )}
      <div className="mb-3">
        <CFormLabel htmlFor="Repository Name">Repository Name</CFormLabel>
        <CFormInput
          id="repository_name"
          autoComplete="repository name"
          placeholder="fastapi-platform"
          value={repositoryName}
          onChange={(e) => setRepositoryName(e.target.value)}
          required
        />
      </div>
      <CButton color="primary" className="w-100" type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit'}
      </CButton>
    </CForm>
  );
};

export default function IntegratePage() {
  return (
    <main>
      <CContainer className="py-5">
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCard className="card-surface">
              <CCardHeader>Integrate</CCardHeader>
              <CCardBody>
                <Form />
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </main>
  );
}
