"use client";

import { useMemo, useState } from "react";
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CAlert,
} from "@coreui/react";
import { useRepositories } from "@/hooks/useRepositories";
import { useDeployments } from "@/hooks/useDeployments";
import { api } from "@/lib/api";

function statusColor(status: string) {
  switch (status) {
    case "WAITING_FOR_APPROVAL":
      return "warning";
    case "APPROVED":
      return "info";
    case "DEPLOYED":
      return "success";
    case "FAILED":
      return "danger";
    default:
      return "secondary";
  }
}

export default function HomePage() {
  const {
    data: repos,
    loading: reposLoading,
    error: reposError,
  } = useRepositories();

  const {
    data: deployments,
    loading: deploymentsLoading,
    error: deploymentsError,
    refetch: refetchDeployments,
  } = useDeployments();

  const [adminToken, setAdminToken] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const waitingCount = useMemo(
    () => deployments.filter((d) => d.status === "WAITING_FOR_APPROVAL").length,
    [deployments]
  );

  async function handleApprove(deploymentId: string) {
    if (!adminToken) {
      setActionError("Admin token is required");
      return;
    }

    setActionError(null);
    setApprovingId(deploymentId);

    try {
      await api.post(`/deployments/${deploymentId}/approve`, null, {
        headers: { "x-admin-token": adminToken },
      });
      await refetchDeployments();
    } catch (err: any) {
      setActionError(err?.message ?? "Approve failed");
    } finally {
      setApprovingId(null);
    }
  }

  if (reposLoading || deploymentsLoading) {
    return (
      <CContainer className="py-5">
        <CCard className="card-surface">
          <CCardBody>Loading data…</CCardBody>
        </CCard>
      </CContainer>
    );
  }

  if (reposError) {
    return (
      <CContainer className="py-5">
        <CAlert color="danger">Repos error: {reposError}</CAlert>
      </CContainer>
    );
  }

  if (deploymentsError) {
    return (
      <CContainer className="py-5">
        <CAlert color="danger">Deployments error: {deploymentsError}</CAlert>
      </CContainer>
    );
  }

  return (
    <main>
      <CContainer>
        <CRow className="align-items-center mb-4">
          <CCol md={8}>
            <div className="pill">Release Control Center</div>
            <h1 className="hero-title">Deployment Tool</h1>
            <p className="hero-subtitle">
              Track deployments, approvals, and environment readiness in one
              place.
            </p>
          </CCol>
          <CCol md={4} className="text-md-end mt-3 mt-md-0">
            <CBadge color={waitingCount ? "warning" : "success"}>
              {waitingCount} waiting approvals
            </CBadge>
          </CCol>
        </CRow>

        <CRow className="g-3 mb-4">
          <CCol md={4}>
            <CCard className="card-surface h-100">
              <CCardHeader>Repositories</CCardHeader>
              <CCardBody>
                <div className="fs-2 fw-bold">{repos.length}</div>
                <div className="text-body-secondary">Connected services</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="card-surface h-100">
              <CCardHeader>Deployments</CCardHeader>
              <CCardBody>
                <div className="fs-2 fw-bold">{deployments.length}</div>
                <div className="text-body-secondary">Total tracked</div>
              </CCardBody>
            </CCard>
          </CCol>
          <CCol md={4}>
            <CCard className="card-surface h-100">
              <CCardHeader>Approvals</CCardHeader>
              <CCardBody>
                <div className="fs-2 fw-bold">{waitingCount}</div>
                <div className="text-body-secondary">Pending review</div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

        <CRow className="g-4">
          <CCol lg={5}>
            <CCard className="card-surface h-100">
              <CCardHeader>Admin</CCardHeader>
              <CCardBody>
                <CInputGroup className="mb-3">
                  <CInputGroupText>Token</CInputGroupText>
                  <CFormInput
                    type="password"
                    value={adminToken}
                    onChange={(e) => setAdminToken(e.target.value)}
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
          </CCol>

          <CCol lg={7}>
            <CCard className="card-surface h-100">
              <CCardHeader>Repositories</CCardHeader>
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
          </CCol>
        </CRow>

        <CRow className="g-4 mt-1">
          <CCol>
            <CCard className="card-surface">
              <CCardHeader>Deployments</CCardHeader>
              <CCardBody>
                <CTable responsive align="middle">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Repository</CTableHeaderCell>
                      <CTableHeaderCell>Environment</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell className="text-end">
                        Actions
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {deployments.map((d) => (
                      <CTableRow key={d.id}>
                        <CTableDataCell>{d.repo}</CTableDataCell>
                        <CTableDataCell>{d.env}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={statusColor(d.status)}>
                            {d.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="text-end">
                          {d.status === "WAITING_FOR_APPROVAL" ? (
                            <CButton
                              color="dark"
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(d.id)}
                              disabled={approvingId === d.id}
                            >
                              {approvingId === d.id
                                ? "Approving…"
                                : "Approve"}
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
          </CCol>
        </CRow>
      </CContainer>
    </main>
  );
}
