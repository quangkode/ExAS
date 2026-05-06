import type { LogStatus, ReportStatus } from '@/types';
import { LOG_STATUS_LABELS, REPORT_STATUS_LABELS } from '@/lib/constants';

interface Props {
  status: LogStatus | ReportStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const allLabels = { ...LOG_STATUS_LABELS, ...REPORT_STATUS_LABELS };
  const label = allLabels[status] || status;

  return (
    <span className={`inline-flex items-center rounded-full font-semibold badge-${status} ${
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    }`}>
      {status === 'pending' && '🟡 '}
      {status === 'approved' && '🟢 '}
      {(status === 'rejected') && '🔴 '}
      {status === 'verified' && '✅ '}
      {label}
    </span>
  );
}
