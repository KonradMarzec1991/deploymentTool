"use client";

import { useMemo, useState } from "react";
import { CCol, CContainer, CRow } from "@coreui/react";
import { useRepositories } from "@/hooks/useRepositories";
import { useDeployments } from "@/hooks/useDeployments";
import { api } from "@/lib/api";
import { LoadingState } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import { StatCard } from "@/components/cards/StatCard";
import { HeroHeader } from "@/components/sections/HeroHeader";
import { AdminCard } from "@/components/sections/AdminCard";
import { RepositoriesCard } from "@/components/sections/RepositoriesCard";
import { DeploymentsCard } from "@/components/sections/DeploymentsCard";

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
    return <LoadingState />;
  }

  if (reposError) {
    return <ErrorState message={`Repos error: ${reposError}`} />;
  }

  if (deploymentsError) {
    return <ErrorState message={`Deployments error: ${deploymentsError}`} />;
  }

  return (
    <main>
      <CContainer>
        <HeroHeader waitingCount={waitingCount} />

        <CRow className="g-3 mb-4">
          <CCol md={4}>
            <StatCard
              title="Repositories"
              value={repos.length}
              subtitle="Connected services"
            />
          </CCol>
          <CCol md={4}>
            <StatCard
              title="Deployments"
              value={deployments.length}
              subtitle="Total tracked"
            />
          </CCol>
          <CCol md={4}>
            <StatCard
              title="Approvals"
              value={waitingCount}
              subtitle="Pending review"
            />
          </CCol>
        </CRow>

        <CRow className="g-4">
          <CCol lg={5}>
            <AdminCard
              adminToken={adminToken}
              actionError={actionError}
              onTokenChange={setAdminToken}
            />
          </CCol>

          <CCol lg={7}>
            <RepositoriesCard repos={repos} />
          </CCol>
        </CRow>

        <CRow className="g-4 mt-1">
          <CCol>
            <DeploymentsCard
              deployments={deployments}
              approvingId={approvingId}
              onApprove={handleApprove}
            />
          </CCol>
        </CRow>
      </CContainer>
    </main>
  );
}
