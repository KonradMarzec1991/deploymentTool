import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CButton,
} from '@coreui/react';
import Link from 'next/link';
import type { Repository } from '@/hooks/useRepositories';

type RepositoriesCardProps = {
  repos: Repository[];
};

export function RepositoriesCard({ repos }: RepositoriesCardProps) {
  return (
    <CCard className="card-surface h-100">
      <CCardHeader className="d-flex align-items-center justify-content-between">
        <span>Repositories</span>
        <Link href="/repos/integrate">
          <CButton color="primary" size="sm">Add repo</CButton>
        </Link>
      </CCardHeader>
      <CCardBody>
        <CTable responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Name</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {repos.map((repo) => (
              <CTableRow key={repo.id}>
                <CTableDataCell>{repo.name}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  );
}
