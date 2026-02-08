import { CCard, CCardBody, CCardHeader } from '@coreui/react';

type StatCardProps = {
  title: string;
  value: number;
  subtitle: string;
};

export function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <CCard className="card-surface h-100">
      <CCardHeader>{title}</CCardHeader>
      <CCardBody>
        <div className="fs-2 fw-bold">{value}</div>
        <div className="text-body-secondary">{subtitle}</div>
      </CCardBody>
    </CCard>
  );
}
