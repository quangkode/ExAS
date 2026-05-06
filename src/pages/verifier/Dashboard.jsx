import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import {
  TreePalm, ClipboardCheck, FileCheck, Award, Eye,
  MapPin, Calendar, ArrowRight, Shield
} from 'lucide-react';

export default function VerifierDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { farms, carbonReports } = useData();

  const stats = useMemo(() => {
    const totalFarms = farms.length;
    const pendingReports = carbonReports.filter(r => r.status === 'submitted').length;
    const verifiedThisMonth = carbonReports.filter(r => r.status === 'verified').length;
    const totalCredits = carbonReports
      .filter(r => r.status === 'verified')
      .reduce((sum, r) => sum + (r.net_carbon_ton || 0), 0);
    return { totalFarms, pendingReports, verifiedThisMonth, totalCredits: totalCredits.toFixed(2) };
  }, [farms, carbonReports]);

  // Merge farms with their latest report
  const farmRows = useMemo(() => {
    return farms.map(farm => {
      const farmReports = carbonReports.filter(r => r.farm_id === farm.id);
      const latestReport = farmReports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      return { ...farm, latestReport };
    });
  }, [farms, carbonReports]);

  return (
    <div className="page-enter max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển kiểm định</h1>
            <p className="text-sm text-gray-500">Xin chào, {user.name}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<TreePalm size={20} />}
          label="Tổng vườn dừa"
          value={stats.totalFarms}
          unit="vườn"
          color="green"
          subtitle="Đang quản lý"
        />
        <StatCard
          icon={<ClipboardCheck size={20} />}
          label="Chờ kiểm định"
          value={stats.pendingReports}
          unit="báo cáo"
          color="amber"
          subtitle="Cần xem xét"
        />
        <StatCard
          icon={<FileCheck size={20} />}
          label="Đã xác minh"
          value={stats.verifiedThisMonth}
          unit="báo cáo"
          color="blue"
          subtitle="Tổng cộng"
        />
        <StatCard
          icon={<Award size={20} />}
          label="Tín chỉ đã xác nhận"
          value={stats.totalCredits}
          unit="tCO₂e"
          color="teal"
          subtitle="Tổng tín chỉ verified"
        />
      </div>

      {/* Farms table */}
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-green-100">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <TreePalm size={18} className="text-green-600" />
            Tổng quan các vườn dừa
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50/50 border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Tên vườn</th>
                <th className="px-5 py-3 font-medium">Nông hộ</th>
                <th className="px-5 py-3 font-medium">Diện tích</th>
                <th className="px-5 py-3 font-medium">Địa điểm</th>
                <th className="px-5 py-3 font-medium">Báo cáo mới nhất</th>
                <th className="px-5 py-3 font-medium">Tín chỉ (tCO₂e)</th>
                <th className="px-5 py-3 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {farmRows.map(farm => (
                <tr key={farm.id} className="border-b border-gray-50 table-row-hover">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                        <TreePalm size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{farm.name}</p>
                        <p className="text-xs text-gray-500">{farm.tree_count} cây • {farm.coconut_variety}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-700">{farm.farmer_id === 'farmer-001' ? 'Nguyễn Văn Minh' : 'Nông hộ khác'}</td>
                  <td className="px-5 py-4 font-semibold">{farm.area_hectares} ha</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} /> {farm.location.split(',').slice(-1)[0]?.trim()}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {farm.latestReport ? <StatusBadge status={farm.latestReport.status} /> : <span className="text-xs text-gray-400">Chưa có</span>}
                  </td>
                  <td className="px-5 py-4 font-bold text-teal-700">
                    {farm.latestReport?.net_carbon_ton?.toFixed(2) || '—'}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => navigate(`/verifier/farm/${farm.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition cursor-pointer"
                    >
                      <Eye size={13} /> Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
