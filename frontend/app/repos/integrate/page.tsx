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

const Form = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // ...handleSubmit
    router.push('/');
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>IntegratePage</h1>
      {/* poal */}
      <CButton color="primary" className="w-100" type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save'}
      </CButton>
    </form>
  );
};

export default function IntegratePage() {
  return (
    <main>
      <CContainer className="py-5">
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCard className="card-surface">
              <CCardHeader>Integrate repository Form</CCardHeader>
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
