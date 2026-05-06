import { useData } from '@/context/AppContext';
import { CheckCircle, AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle,
  error: AlertOctagon,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  warning: 'bg-amber-600',
  info: 'bg-blue-600',
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useData();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 no-print">
      {toasts.map(toast => {
        const Icon = ICONS[toast.type];
        return (
          <div key={toast.id}
            className={`${COLORS[toast.type]} text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 min-w-[300px] max-w-[420px] animate-toast-in`}>
            <Icon className="w-5 h-5 shrink-0" />
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button onClick={() => dismissToast(toast.id)}
              className="shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
