export function statusColor(status: string) {
  switch (status) {
    case 'WAITING_FOR_APPROVAL':
      return 'warning';
    case 'APPROVED':
      return 'info';
    case 'DEPLOYED':
      return 'success';
    case 'FAILED':
      return 'danger';
    default:
      return 'secondary';
  }
}
