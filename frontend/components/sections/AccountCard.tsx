import { CButton, CCard, CCardBody, CCardHeader } from "@coreui/react";

type AccountCardProps = {
  onSignOut: () => void;
};

export function AccountCard({ onSignOut }: AccountCardProps) {
  return (
    <CCard className="card-surface h-100">
      <CCardHeader>Account</CCardHeader>
      <CCardBody>
        <div className="text-body-secondary mb-3">Manage your profile and security.</div>
        <div className="d-flex gap-2 flex-wrap">
          <CButton color="dark" variant="outline" href="/account">
            Profile
          </CButton>
          <CButton color="dark" variant="outline" onClick={onSignOut}>
            Sign out
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  );
}
