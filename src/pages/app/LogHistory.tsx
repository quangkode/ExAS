import { useState, useMemo } from 'react';
import { useAuth, useData } from '@/context/AppContext';
import StatusBadge from '@/components/ui/StatusBadge';
import EvidenceViewer from '@/components/evidence/EvidenceViewer';
import Modal from '@/components/ui/Modal';
import { ACTIVITY_LABELS } from '@/lib/constants';
import type { FarmingLog } from '@/types';
import { ClipboardList, Search, Trash2, Edit, Eye } from 'lucide-react';

export default function LogHistory() {
  const { user } = useAuth();
  const { farmingLogs, farms, logEvidence, deleteFarmingLog, updateFarmingLog, showToast, addAuditEntry } = useData();
  if (!user) return null;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [farmFilter, setFarmFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewLog, setViewLog] = useState<FarmingLog | null>(null);
  const [editLog, setEditLog] = useState<FarmingLog | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const myLogs = useMemo(() => {
    let logs = farmingLogs.filter(l => l.supervisor_id === user.id);
    if (statusFilter !== 'all') logs = logs.filter(l => l.status === statusFilter);
    if (typeFilter !== 'all') logs = logs.filter(l => l.activity_type === typeFilter);
    if (farmFilter !== 'all') logs = logs.filter(l => l.farm_id === farmFilter);
    if (dateFrom) logs = logs.filter(l => l.log_date >= dateFrom);
    if (dateTo) logs = logs.filter(l => l.log_date <= dateTo);
    if (search) logs = logs.filter(l => l.log_date.includes(search) || l.notes.toLowerCase().includes(search.toLowerCase()));
    return logs.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }, [farmingLogs, user.id, statusFilter, typeFilter, farmFilter, dateFrom, dateTo, search]);

  const assignedFarms = user.role === 'manager' ? farms : farms.filter(f => user.assigned_farm_ids.includes(f.id));

  const handleDelete = (log: FarmingLog) => {
    if (log.status !== 'pending') return;
    deleteFarmingLog(log.id);
    addAuditEntry({ user_id: user.id, user_name: user.full_name, action: 'Xóa nhật kí', target_type: 'farming_log', target_id: log.id, details: `Xóa ${ACTIVITY_LABELS[log.activity_type]}` });
    showToast('success', 'Đã xóa nhật kí');
  };

  const openEdit = (log: FarmingLog) => {
    setEditLog(log);
    setEditQuantity(String(log.quantity));
    setEditNotes(log.notes);
  };

  const handleEdit = () => {
    if (!editLog) return;
    updateFarmingLog(editLog.id, { quantity: parseFloat(editQuantity) || editLog.quantity, notes: editNotes });
    addAuditEntry({ user_id: user.id, user_name: user.full_name, action: 'Sửa nhật kí', target_type: 'farming_log', target_id: editLog.id, details: `Cập nhật ${ACTIVITY_LABELS[editLog.activity_type]}: ${editQuantity} ${editLog.unit}` });
    showToast('success', 'Đã cập nhật nhật kí');
    setEditLog(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><ClipboardList className="w-6 h-6 text-green-600" /><h2 className="text-2xl font-bold text-gray-800">Nhật kí đã nộp</h2></div>
        <span className="text-sm text-gray-500">{myLogs.length} bản ghi</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Tìm theo ngày hoặc ghi chú..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <select value={farmFilter} onChange={e => setFarmFilter(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none">
          <option value="all">Tất cả vườn</option>
          {assignedFarms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none">
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none">
          <option value="all">Tất cả loại</option>
          {Object.entries(ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none" title="Từ ngày" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none" title="Đến ngày" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Ngày</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Vườn</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Loại hoạt động</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Số lượng</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Bằng chứng</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Trạng thái</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Hành động</th>
            </tr></thead>
            <tbody>
              {myLogs.map(log => {
                const farm = farms.find(f => f.id === log.farm_id);
                const evidence = logEvidence.filter(e => e.log_id === log.id);
                return (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4">{log.log_date}</td>
                    <td className="py-3 px-4 text-gray-600">{farm?.name}</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{ACTIVITY_LABELS[log.activity_type]}</span></td>
                    <td className="py-3 px-4 font-medium">{log.quantity} {log.unit}</td>
                    <td className="py-3 px-4">{evidence.length > 0 ? <span className="text-xs text-blue-600">{evidence.length} ảnh</span> : <span className="text-xs text-gray-400">—</span>}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={log.status} />
                      {log.status === 'rejected' && log.review_note && <p className="text-xs text-red-500 mt-1 max-w-[180px] truncate" title={log.review_note}>{log.review_note}</p>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewLog(log)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Xem chi tiết"><Eye className="w-4 h-4 text-gray-400" /></button>
                        {log.status === 'pending' && (
                          <>
                            <button onClick={() => openEdit(log)} className="p-1.5 hover:bg-blue-50 rounded-lg" title="Chỉnh sửa"><Edit className="w-4 h-4 text-blue-400" /></button>
                            <button onClick={() => handleDelete(log)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Xóa"><Trash2 className="w-4 h-4 text-red-400" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {myLogs.length === 0 && <div className="text-center py-12 text-gray-400">Chưa có nhật kí nào</div>}
        </div>
      </div>

      {/* View Detail Modal */}
      <Modal isOpen={!!viewLog} onClose={() => setViewLog(null)} title="Chi tiết nhật kí" size="lg">
        {viewLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Ngày:</span><span className="ml-2 font-medium">{viewLog.log_date}</span></div>
              <div><span className="text-gray-500">Vườn:</span><span className="ml-2 font-medium">{farms.find(f => f.id === viewLog.farm_id)?.name}</span></div>
              <div><span className="text-gray-500">Hoạt động:</span><span className="ml-2 font-medium">{ACTIVITY_LABELS[viewLog.activity_type]}</span></div>
              <div><span className="text-gray-500">Số lượng:</span><span className="ml-2 font-medium">{viewLog.quantity} {viewLog.unit}</span></div>
              <div><span className="text-gray-500">Trạng thái:</span><span className="ml-2"><StatusBadge status={viewLog.status} /></span></div>
              {viewLog.notes && <div className="col-span-2"><span className="text-gray-500">Ghi chú:</span><span className="ml-2">{viewLog.notes}</span></div>}
              {viewLog.review_note && <div className="col-span-2"><span className="text-gray-500">Ghi chú duyệt:</span><span className="ml-2 text-red-600">{viewLog.review_note}</span></div>}
            </div>
            <EvidenceViewer evidence={logEvidence.filter(e => e.log_id === viewLog.id)} />
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editLog} onClose={() => setEditLog(null)} title="Chỉnh sửa nhật kí">
        {editLog && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
              <span className="font-medium">{ACTIVITY_LABELS[editLog.activity_type]}</span> • {editLog.log_date} • {farms.find(f => f.id === editLog.farm_id)?.name}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng ({editLog.unit})</label>
              <input type="number" min="0" step="0.1" value={editQuantity} onChange={e => setEditQuantity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none h-20" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditLog(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Hủy</button>
              <button onClick={handleEdit} disabled={!editQuantity} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50">Lưu thay đổi</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
