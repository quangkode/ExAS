import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { ClipboardList, Eye, Filter } from 'lucide-react';

export default function VerifierReports() {
  const navigate = useNavigate();
  const { carbonReports, farms } = useData();
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = [...carbonReports];
    if (filter !== 'all') list = list.filter(r => r.status === filter);
    return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [carbonReports, filter]);

  const getFarmName = (farmId) => farms.find(f => f.id === farmId)?.name || farmId;

  return (
    <div className="page-enter max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <ClipboardList size={24} className="text-blue-600" /> Báo cáo kiểm định
      </h1>
      <p className="text-sm text-gray-500 mb-6">Quản lý tất cả báo cáo từ các vườn dừa</p>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-5">
        <Filter size={14} className="text-gray-400" />
        {['all', 'submitted', 'verified', 'rejected', 'draft'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filter === f ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}>
            {f === 'all' ? 'Tất cả' : f === 'submitted' ? 'Chờ kiểm định' : f === 'verified' ? 'Đã xác minh' : f === 'rejected' ? 'Từ chối' : 'Bản nháp'}
            {f === 'submitted' && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[10px]">
                {carbonReports.filter(r => r.status === 'submitted').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {filtered.map(report => (
          <div key={report.id}
            className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-gray-800">{report.season_name || 'Báo cáo'}</h4>
                  <StatusBadge status={report.status} />
                </div>
                <p className="text-xs text-gray-500">
                  {getFarmName(report.farm_id)} • {report.season_start} → {report.season_end}
                </p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="text-green-600 font-semibold">+{(report.soc_change_ton * 3.67).toFixed(2)} tCO₂e hấp thụ</span>
                  <span className="text-red-500">-{(report.fossil_co2_ton + report.lime_co2_ton + report.fertilizer_n2o_ton).toFixed(3)} tCO₂e phát thải</span>
                  <span className="text-teal-700 font-bold">Net: {report.net_carbon_ton?.toFixed(2)} tCO₂e</span>
                </div>
              </div>
              <button onClick={() => navigate(`/verifier/farm/${report.farm_id}`)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition cursor-pointer">
                <Eye size={14} /> Xem
              </button>
            </div>
            {report.verifier_notes && (
              <div className="mt-3 bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                📝 {report.verifier_notes}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-2 opacity-30" />
            <p>Không có báo cáo nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
