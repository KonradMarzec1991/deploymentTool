import { CButton, CCard, CCardBody, CCardHeader } from "@coreui/react";

type AccountCardProps = {
  onSignOut: () => void;
};

export function AccountCard({ onSignOut }: AccountCardProps) {
  return (
    <CCard className="card-surface h-100">
      <CCardHeader>Account</CCardHeader>
      <CCardBody>
        <div className="text-body-secondary mb-3">Signed in via GitHub</div>
        <CButton color="dark" variant="outline" onClick={onSignOut}>
          Sign out
        </CButton>
      </CCardBody>
    </CCard>
  );
}
