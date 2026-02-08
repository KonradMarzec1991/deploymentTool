import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react';
import type { Deployment } from '@/hooks/useDeployments';
import { statusColor } from '@/utils/statusColor';

type DeploymentsCardProps = {
  deployments: Deployment[];
  approvingId: string | null;
  onApprove: (deploymentId: string) => void;
};

export function DeploymentsCard({ deployments, approvingId, onApprove }: DeploymentsCardProps) {
  return (
    <CCard className="card-surface">
      <CCardHeader>Deployments</CCardHeader>
      <CCardBody>
        <CTable responsive align="middle">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Repository</CTableHeaderCell>
              <CTableHeaderCell>Environment</CTableHeaderCell>
              <CTableHeaderCell>Status</CTableHeaderCell>
              <CTableHeaderCell className="text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {deployments.map((d) => (
              <CTableRow key={d.id}>
                <CTableDataCell>{d.repo}</CTableDataCell>
                <CTableDataCell>{d.env}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color={statusColor(d.status)}>{d.status}</CBadge>
                </CTableDataCell>
                <CTableDataCell className="text-end">
                  {d.status === 'WAITING_FOR_APPROVAL' ? (
                    <CButton
                      color="dark"
                      variant="outline"
                      size="sm"
                      onClick={() => onApprove(d.id)}
                      disabled={approvingId === d.id}
                    >
                      {approvingId === d.id ? 'Approving…' : 'Approve'}
                    </CButton>
                  ) : (
                    <span className="text-body-secondary">—</span>
                  )}
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
}
