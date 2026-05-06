import { REPORT_STATUS_LABELS, REPORT_STATUS_COLORS } from '../data/constants';

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
        REPORT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'
      } ${status === 'submitted' ? 'badge-pulse' : ''}`}
    >
      {REPORT_STATUS_LABELS[status] || status}
    </span>
  );
}
