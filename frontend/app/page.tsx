'use client';

import { useEffect, useMemo, useState } from 'react';
import { CCol, CContainer, CRow } from '@coreui/react';
import { useRepositories } from '@/hooks/useRepositories';
import { useDeployments } from '@/hooks/useDeployments';
import { api } from '@/lib/api';
import {
  LoadingState,
  ErrorState,
  StatCard,
  HeroHeader,
  AccountCard,
  RepositoriesCard,
  DeploymentsCard,
} from '@/components';
import { clearAuthToken, getAuthToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const { data: repos, loading: reposLoading, error: reposError } = useRepositories();

  const {
    data: deployments,
    loading: deploymentsLoading,
    error: deploymentsError,
    refetch: refetchDeployments,
  } = useDeployments();

  const [actionError, setActionError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const waitingCount = useMemo(
    () => deployments.filter((d) => d.status === 'WAITING_FOR_APPROVAL').length,
    [deployments]
  );

  async function handleApprove(deploymentId: string) {
    setActionError(null);
    setApprovingId(deploymentId);

    try {
      await api.post(`/deployments/${deploymentId}/approve`, null);
      await refetchDeployments();
    } catch (err: any) {
      setActionError(err?.message ?? 'Approve failed');
    } finally {
      setApprovingId(null);
    }
  }

  if (!authChecked) {
    return <LoadingState message="Redirecting to login…" />;
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
            <StatCard title="Repositories" value={repos.length} subtitle="Connected services" />
          </CCol>
          <CCol md={4}>
            <StatCard title="Deployments" value={deployments.length} subtitle="Total tracked" />
          </CCol>
          <CCol md={4}>
            <StatCard title="Approvals" value={waitingCount} subtitle="Pending review" />
          </CCol>
        </CRow>

        <CRow className="g-4">
          <CCol lg={5}>
            <AccountCard
              onSignOut={() => {
                clearAuthToken();
                router.replace('/login');
              }}
            />
          </CCol>

          <CCol lg={7}>
            <RepositoriesCard repos={repos} />
          </CCol>
        </CRow>

        <CRow className="g-4 mt-1">
          <CCol>
            {actionError && <ErrorState message={actionError} />}
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
