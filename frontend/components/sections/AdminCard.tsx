import {
  CAlert,
  CCard,
  CCardBody,
  CCardHeader,
  CFormInput,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react';

type AdminCardProps = {
  adminToken: string;
  actionError: string | null;
  onTokenChange: (value: string) => void;
};

export function AdminCard({ adminToken, actionError, onTokenChange }: AdminCardProps) {
  return (
    <CCard className="card-surface h-100">
      <CCardHeader>Admin</CCardHeader>
      <CCardBody>
        <CInputGroup className="mb-3">
          <CInputGroupText>Token</CInputGroupText>
          <CFormInput
            type="password"
            value={adminToken}
            onChange={(e) => onTokenChange(e.target.value)}
            placeholder="Enter admin token"
          />
        </CInputGroup>
        {actionError && (
          <CAlert color="danger" className="mb-0">
            {actionError}
          </CAlert>
        )}
      </CCardBody>
    </CCard>
  );
}
