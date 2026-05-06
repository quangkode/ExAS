import { useData } from '@/context/AppContext';
import { Search, User, Clock } from 'lucide-react';

export default function AuditLog() {
  const { auditLog } = useData();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Lịch sử hoạt động</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="divide-y divide-gray-50">
          {auditLog.map(entry => (
            <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50">
              <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-green-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">
                  <span className="font-medium">{entry.user_name}</span>
                  <span className="mx-1.5 text-gray-400">•</span>
                  <span className="text-gray-600">{entry.action}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{entry.details}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {new Date(entry.created_at).toLocaleString('vi-VN')}
              </div>
            </div>
          ))}
          {auditLog.length === 0 && (
            <div className="text-center py-12 text-gray-400">Chưa có hoạt động nào</div>
          )}
        </div>
      </div>
    </div>
  );
}
