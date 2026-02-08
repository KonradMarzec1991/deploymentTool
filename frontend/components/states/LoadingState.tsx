import { CCard, CCardBody, CContainer } from "@coreui/react";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading data…" }: LoadingStateProps) {
  return (
    <CContainer className="py-5">
      <CCard className="card-surface">
        <CCardBody>{message}</CCardBody>
      </CCard>
    </CContainer>
  );
}
