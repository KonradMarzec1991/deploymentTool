import { CBadge, CCol, CRow } from "@coreui/react";

type HeroHeaderProps = {
  waitingCount: number;
};

export function HeroHeader({ waitingCount }: HeroHeaderProps) {
  return (
    <CRow className="align-items-center mb-4">
      <CCol md={8}>
        <div className="pill">Release Control Center</div>
        <h1 className="hero-title">Deployment Tool</h1>
        <p className="hero-subtitle">
          Track deployments, approvals, and environment readiness in one place.
        </p>
      </CCol>
      <CCol md={4} className="text-md-end mt-3 mt-md-0">
        <CBadge color={waitingCount ? "warning" : "success"}>
          {waitingCount} waiting approvals
        </CBadge>
      </CCol>
    </CRow>
  );
}
