import { CAlert, CContainer } from '@coreui/react';

type ErrorStateProps = {
  message: string;
};

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <CContainer className="py-5">
      <CAlert color="danger">{message}</CAlert>
    </CContainer>
  );
}
