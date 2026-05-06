import { useState, useMemo } from 'react';
import { useAuth, useData } from '@/context/AppContext';
import StatusBadge from '@/components/ui/StatusBadge';
import EvidenceViewer from '@/components/evidence/EvidenceViewer';
import Modal from '@/components/ui/Modal';
import { ACTIVITY_LABELS } from '@/lib/constants';
import type { FarmingLog } from '@/types';
import { CheckSquare, Check, X, Clock, CheckCircle, XCircle, History } from 'lucide-react';

export default function Review() {
  const { user } = useAuth();
  const { farmingLogs, farms, profiles, logEvidence, fuelDetails, limeDetails, fertDetails, socDetails, reviewLog, showToast, addAuditEntry } = useData();
  if (!user) return null;

  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedLog, setSelectedLog] = useState<FarmingLog | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const filtered = useMemo(() => farmingLogs.filter(l => l.status === tab).sort((a, b) => b.created_at.localeCompare(a.created_at)), [farmingLogs, tab]);

  const todayApproved = farmingLogs.filter(l => l.status === 'approved' && l.reviewed_at?.startsWith(new Date().toISOString().slice(0, 10))).length;
  const pendingCount = farmingLogs.filter(l => l.status === 'pending').length;

  const handleApprove = (log: FarmingLog) => {
    reviewLog(log.id, 'approved', '', user.id);
    addAuditEntry({ user_id: user.id, user_name: user.full_name, action: 'Duyệt nhật kí', target_type: 'farming_log', target_id: log.id, details: `Đã duyệt ${ACTIVITY_LABELS[log.activity_type]}` });
    showToast('success', 'Đã duyệt nhật kí');
    setSelectedLog(null);
  };

  const handleReject = (log: FarmingLog) => {
    if (!rejectNote.trim()) return;
    reviewLog(log.id, 'rejected', rejectNote, user.id);
    addAuditEntry({ user_id: user.id, user_name: user.full_name, action: 'Từ chối nhật kí', target_type: 'farming_log', target_id: log.id, details: `Từ chối: ${rejectNote}` });
    showToast('error', 'Đã từ chối nhật kí');
    setSelectedLog(null);
    setRejectNote('');
    setShowRejectInput(false);
  };

  const getDetail = (log: FarmingLog) => {
    if (log.activity_type === 'fossil_fuel') return fuelDetails.find(d => d.log_id === log.id);
    if (log.activity_type === 'lime_application') return limeDetails.find(d => d.log_id === log.id);
    if (log.activity_type === 'fertilizer') return fertDetails.find(d => d.log_id === log.id);
    if (log.activity_type === 'soc_measurement') return socDetails.find(d => d.log_id === log.id);
    return null;
  };

  const tabs = [
    { key: 'pending' as const, label: 'Chờ duyệt', icon: Clock, count: pendingCount },
    { key: 'approved' as const, label: 'Đã duyệt', icon: CheckCircle, count: undefined },
    { key: 'rejected' as const, label: 'Đã từ chối', icon: XCircle, count: undefined },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><CheckSquare className="w-6 h-6 text-green-600" /><h2 className="text-2xl font-bold text-gray-800">Duyệt nhật kí canh tác</h2></div>
        <div className="flex items-center gap-4 text-sm">
          <span className="badge-pending px-3 py-1 rounded-full font-medium">{pendingCount} chờ duyệt</span>
          <span className="badge-approved px-3 py-1 rounded-full font-medium">{todayApproved} duyệt hôm nay</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" />{t.label}
            {t.count !== undefined && t.count > 0 && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-xs">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Ngày nộp</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Giám sát viên</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Vườn</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Loại</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Số lượng</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Bằng chứng</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Hành động</th>
          </tr></thead>
          <tbody>
            {filtered.map(log => {
              const sv = profiles.find(p => p.id === log.supervisor_id);
              const farm = farms.find(f => f.id === log.farm_id);
              const evidence = logEvidence.filter(e => e.log_id === log.id);
              return (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-green-50/30 cursor-pointer" onClick={() => { setSelectedLog(log); setShowRejectInput(false); setRejectNote(''); }}>
                  <td className="py-3 px-4">{log.log_date}</td>
                  <td className="py-3 px-4">{sv?.full_name}</td>
                  <td className="py-3 px-4 text-gray-600">{farm?.name}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{ACTIVITY_LABELS[log.activity_type]}</span></td>
                  <td className="py-3 px-4 font-medium">{log.quantity} {log.unit}</td>
                  <td className="py-3 px-4">{evidence.length > 0 ? <span className="text-xs text-blue-600">{evidence.length} ảnh</span> : '—'}</td>
                  <td className="py-3 px-4">
                    {tab === 'pending' && (
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleApprove(log)} className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg text-green-700 transition-colors"><Check className="w-4 h-4" /></button>
                        <button onClick={() => { setSelectedLog(log); setShowRejectInput(true); }} className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-red-700 transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                    {tab !== 'pending' && <StatusBadge status={log.status} />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400">Không có nhật kí nào</div>}
      </div>

      {/* Detail modal */}
      <Modal isOpen={!!selectedLog} onClose={() => { setSelectedLog(null); setShowRejectInput(false); }} title="Chi tiết nhật kí" size="lg">
        {selectedLog && (() => {
          const sv = profiles.find(p => p.id === selectedLog.supervisor_id);
          const farm = farms.find(f => f.id === selectedLog.farm_id);
          const evidence = logEvidence.filter(e => e.log_id === selectedLog.id);
          const detail = getDetail(selectedLog);
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Giám sát viên:</span><span className="ml-2 font-medium">{sv?.full_name}</span></div>
                <div><span className="text-gray-500">Vườn:</span><span className="ml-2 font-medium">{farm?.name}</span></div>
                <div><span className="text-gray-500">Ngày:</span><span className="ml-2 font-medium">{selectedLog.log_date}</span></div>
                <div><span className="text-gray-500">Loại:</span><span className="ml-2 font-medium">{ACTIVITY_LABELS[selectedLog.activity_type]}</span></div>
                <div><span className="text-gray-500">Số lượng:</span><span className="ml-2 font-medium">{selectedLog.quantity} {selectedLog.unit}</span></div>
                <div><span className="text-gray-500">Trạng thái:</span><span className="ml-2"><StatusBadge status={selectedLog.status} /></span></div>
                {selectedLog.notes && <div className="col-span-2"><span className="text-gray-500">Ghi chú:</span><span className="ml-2">{selectedLog.notes}</span></div>}
                {detail && Object.entries(detail).filter(([k]) => k !== 'log_id').map(([k, v]) => (
                  <div key={k}><span className="text-gray-500">{k}:</span><span className="ml-2 font-medium">{String(v)}</span></div>
                ))}
              </div>
              <EvidenceViewer evidence={evidence} />

              {/* Previous entries for same activity type on this farm */}
              {(() => {
                const history = farmingLogs
                  .filter(l => l.id !== selectedLog.id && l.farm_id === selectedLog.farm_id && l.activity_type === selectedLog.activity_type && l.status === 'approved')
                  .sort((a, b) => b.log_date.localeCompare(a.log_date))
                  .slice(0, 5);
                if (!history.length) return null;
                return (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mb-3"><History className="w-3.5 h-3.5" />Lịch sử gần đây — {ACTIVITY_LABELS[selectedLog.activity_type]}</p>
                    <div className="space-y-1.5">
                      {history.map(h => (
                        <div key={h.id} className="flex items-center justify-between text-xs text-gray-600">
                          <span className="text-gray-400">{h.log_date}</span>
                          <span className="font-medium">{h.quantity} {h.unit}</span>
                          <span className="text-green-600 text-xs">✅ đã duyệt</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {selectedLog.status === 'pending' && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  {showRejectInput && (
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối *</label><textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none h-20" placeholder="Nhập lý do từ chối..." /></div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => handleApprove(selectedLog)} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2"><Check className="w-4 h-4" />Duyệt</button>
                    {!showRejectInput ? (
                      <button onClick={() => setShowRejectInput(true)} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 flex items-center justify-center gap-2"><X className="w-4 h-4" />Từ chối</button>
                    ) : (
                      <button onClick={() => handleReject(selectedLog)} disabled={!rejectNote.trim()} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"><X className="w-4 h-4" />Xác nhận từ chối</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
