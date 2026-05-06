import { useMemo } from 'react';
import { useAuth, useData } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { ACTIVITY_LABELS } from '@/lib/constants';
import { TreePalm, Users, Clock, Leaf, CheckCircle, Droplets, Sprout, FilePlus } from 'lucide-react';

export default function AppDashboard() {
  const { user } = useAuth();
  const { farms, farmingLogs, profiles, carbonReports } = useData();
  const navigate = useNavigate();
  if (!user) return null;

  const isManager = user.role === 'manager';

  // Supervisor view
  if (!isManager) {
    const assignedFarms = farms.filter(f => user.assigned_farm_ids.includes(f.id));
    const myLogs = farmingLogs.filter(l => l.supervisor_id === user.id);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthLogs = myLogs.filter(l => l.created_at.slice(0, 7) === thisMonth);
    const pendingCount = myLogs.filter(l => l.status === 'pending').length;
    const approvedCount = myLogs.filter(l => l.status === 'approved').length;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Tổng quan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<TreePalm className="w-5 h-5" />} label="Vườn được phân công" value={assignedFarms.length} color="green" />
          <StatCard icon={<FilePlus className="w-5 h-5" />} label="Nhật kí tháng này" value={monthLogs.length} color="blue" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Chờ duyệt" value={pendingCount} color="amber" />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Đã duyệt" value={approvedCount} color="teal" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Vườn của tôi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedFarms.map(farm => {
            const farmer = profiles.find(p => p.id === farm.farmer_id);
            const farmLogs = farmingLogs.filter(l => l.farm_id === farm.id && l.status === 'approved');
            const latestMoisture = farmLogs.filter(l => l.activity_type === 'soil_moisture').sort((a, b) => b.log_date.localeCompare(a.log_date))[0];
            const latestPH = farmLogs.filter(l => l.activity_type === 'soil_ph').sort((a, b) => b.log_date.localeCompare(a.log_date))[0];
            return (
              <div key={farm.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div><h4 className="font-semibold text-gray-800">{farm.name}</h4><p className="text-xs text-gray-500">{farm.area_hectares} ha • {farmer?.full_name}</p></div>
                  <TreePalm className="w-8 h-8 text-green-200" />
                </div>
                <div className="space-y-2 mb-4">
                  {latestMoisture && <div className="flex items-center gap-2 text-sm"><Droplets className="w-4 h-4 text-blue-400" /><span className="text-gray-600">Độ ẩm:</span><span className="font-medium">{latestMoisture.quantity.toFixed(1)}%</span></div>}
                  {latestPH && <div className="flex items-center gap-2 text-sm"><Sprout className="w-4 h-4 text-green-400" /><span className="text-gray-600">pH:</span><span className="font-medium">{latestPH.quantity.toFixed(1)}</span></div>}
                </div>
                <button onClick={() => navigate('/app/log/new')} className="w-full py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <FilePlus className="w-4 h-4" /> Nhập nhật kí
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Manager view
  const pendingCount = farmingLogs.filter(l => l.status === 'pending').length;
  const activeSupervisors = profiles.filter(p => p.role === 'supervisor' && p.is_active).length;
  const totalCarbon = carbonReports.reduce((sum, r) => sum + Math.max(0, r.net_carbon_ton), 0);
  const verifiedCredits = carbonReports.filter(r => r.status === 'verified').reduce((sum, r) => sum + Math.max(0, r.net_carbon_ton), 0);

  const recentLogs = farmingLogs.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tổng quan quản lí</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<TreePalm className="w-5 h-5" />} label="Tổng số vườn" value={farms.length} color="green" />
        <StatCard icon={<Users className="w-5 h-5" />} label="Giám sát viên" value={activeSupervisors} color="blue" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Chờ duyệt" value={pendingCount} color="amber" onClick={() => navigate('/app/review')} />
        <StatCard icon={<Leaf className="w-5 h-5" />} label="Carbon ước tính" value={totalCarbon} unit="tCO₂e" color="teal" />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Tín chỉ xác minh" value={verifiedCredits} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Tất cả vườn</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100"><th className="text-left py-2 px-3 text-gray-500 font-medium">Tên vườn</th><th className="text-left py-2 px-3 text-gray-500 font-medium">Nông hộ</th><th className="text-left py-2 px-3 text-gray-500 font-medium">Diện tích</th><th className="text-left py-2 px-3 text-gray-500 font-medium">Cập nhật gần nhất</th><th className="text-left py-2 px-3 text-gray-500 font-medium">Chờ duyệt</th><th className="text-left py-2 px-3 text-gray-500 font-medium">Carbon ước tính</th><th className="text-left py-2 px-3 text-gray-500 font-medium">Báo cáo</th></tr></thead>
              <tbody>
                {farms.map(farm => {
                  const farmer = profiles.find(p => p.id === farm.farmer_id);
                  const pending = farmingLogs.filter(l => l.farm_id === farm.id && l.status === 'pending').length;
                  const report = carbonReports.find(r => r.farm_id === farm.id);
                  const latestLog = farmingLogs.filter(l => l.farm_id === farm.id).sort((a, b) => b.log_date.localeCompare(a.log_date))[0];
                  return (
                    <tr key={farm.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-medium">{farm.name}</td>
                      <td className="py-3 px-3 text-gray-600">{farmer?.full_name}</td>
                      <td className="py-3 px-3">{farm.area_hectares} ha</td>
                      <td className="py-3 px-3 text-xs text-gray-500">{latestLog ? latestLog.log_date : <span className="text-gray-300">—</span>}</td>
                      <td className="py-3 px-3">{pending > 0 ? <span className="badge-pending px-2 py-0.5 rounded-full text-xs font-medium">{pending}</span> : <span className="text-gray-400">0</span>}</td>
                      <td className="py-3 px-3 text-xs font-medium text-green-700">{report ? `${Math.max(0, report.net_carbon_ton).toFixed(1)} tCO₂e` : <span className="text-gray-300">—</span>}</td>
                      <td className="py-3 px-3">{report ? <StatusBadge status={report.status} /> : <span className="text-gray-400">—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Hoạt động mới nhất</h3>
          <div className="space-y-3">
            {recentLogs.map(log => {
              const sv = profiles.find(p => p.id === log.supervisor_id);
              return (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-xs shrink-0">{sv?.full_name.charAt(0)}</div>
                  <div className="flex-1 min-w-0"><p className="text-gray-700"><span className="font-medium">{sv?.full_name}</span> — {ACTIVITY_LABELS[log.activity_type]}</p><p className="text-xs text-gray-400">{log.log_date} • {log.quantity} {log.unit}</p></div>
                  <StatusBadge status={log.status} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
