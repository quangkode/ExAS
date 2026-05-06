import { useState, useMemo } from 'react';
import { useAuth, useData } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { ACTIVITY_LABELS, SOIL_THRESHOLDS } from '@/lib/constants';
import { calculateFuelEmissions, calculateLimeEmissions, calculateN2OEmissions, calculateSOCAbsorption } from '@/lib/calculations';
import { TreePalm, Users, Clock, Leaf, CheckCircle, Droplets, Factory, Award, FileBarChart, FilePlus, AlertTriangle, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceArea, ReferenceLine } from 'recharts';

// ─── Supervisor Dashboard ──────────────────────────────────────────────────────
function SupervisorDashboard() {
  const { user } = useAuth();
  const { farms, farmingLogs, fuelDetails, limeDetails, fertDetails, carbonReports, profiles } = useData();
  const navigate = useNavigate();
  if (!user) return null;

  const assignedFarms = farms.filter(f => user.assigned_farm_ids.includes(f.id));
  const [selectedFarmId, setSelectedFarmId] = useState(assignedFarms[0]?.id || '');
  const farm = farms.find(f => f.id === selectedFarmId);

  const approvedLogs = useMemo(
    () => farmingLogs.filter(l => l.farm_id === selectedFarmId && l.status === 'approved'),
    [farmingLogs, selectedFarmId]
  );

  const stats = useMemo(() => {
    const socLogs = approvedLogs.filter(l => l.activity_type === 'soc_measurement').sort((a, b) => a.log_date.localeCompare(b.log_date));
    const startSOC = socLogs[0]?.quantity || 0;
    const endSOC = socLogs[socLogs.length - 1]?.quantity || 0;
    const absorbed = startSOC && endSOC && farm ? calculateSOCAbsorption(startSOC, endSOC, farm.area_hectares) : 0;
    const fuelLogs = approvedLogs.filter(l => l.activity_type === 'fossil_fuel').map(l => ({ quantity: l.quantity, fuel_type: (fuelDetails.find(f => f.log_id === l.id)?.fuel_type || 'diesel') as 'gasoline' | 'diesel' }));
    const limeLogs = approvedLogs.filter(l => l.activity_type === 'lime_application').map(l => ({ quantity: l.quantity, lime_type: (limeDetails.find(f => f.log_id === l.id)?.lime_type || 'cao3') as 'cao3' | 'dolomite' }));
    const fLogs = approvedLogs.filter(l => l.activity_type === 'fertilizer').map(l => ({ quantity: l.quantity, nitrogen_percent: fertDetails.find(f => f.log_id === l.id)?.nitrogen_percent || 0 }));
    const emitted = calculateFuelEmissions(fuelLogs) + calculateLimeEmissions(limeLogs) + calculateN2OEmissions(fLogs);
    return { absorbed, emitted, credits: Math.max(0, absorbed - emitted), latestReport: carbonReports.find(r => r.farm_id === selectedFarmId) };
  }, [approvedLogs, farm, fuelDetails, limeDetails, fertDetails, carbonReports, selectedFarmId]);

  const moistureData = useMemo(() =>
    approvedLogs.filter(l => l.activity_type === 'soil_moisture').sort((a, b) => a.log_date.localeCompare(b.log_date)).slice(-30).map(l => ({ date: l.log_date.slice(5), value: l.quantity })),
    [approvedLogs]
  );

  const emissionsData = useMemo(() => {
    const m: Record<string, { month: string; fuel: number; lime: number; n2o: number }> = {};
    approvedLogs.filter(l => ['fossil_fuel', 'lime_application', 'fertilizer'].includes(l.activity_type)).forEach(l => {
      const month = l.log_date.slice(0, 7);
      if (!m[month]) m[month] = { month: month.slice(5), fuel: 0, lime: 0, n2o: 0 };
      if (l.activity_type === 'fossil_fuel') { const d = fuelDetails.find(f => f.log_id === l.id); m[month].fuel += (l.quantity * (d?.fuel_type === 'gasoline' ? 2.31 : 2.68)) / 1000; }
      if (l.activity_type === 'lime_application') { const d = limeDetails.find(f => f.log_id === l.id); m[month].lime += (l.quantity * (d?.lime_type === 'dolomite' ? 0.477 : 0.44)) / 1000; }
      if (l.activity_type === 'fertilizer') { const d = fertDetails.find(f => f.log_id === l.id); m[month].n2o += (l.quantity * ((d?.nitrogen_percent || 0) / 100) * 0.01 * (44 / 28) * 298) / 1000; }
    });
    return Object.values(m);
  }, [approvedLogs, fuelDetails, limeDetails, fertDetails]);

  const recommendations = useMemo(() => {
    const recs: Array<{ type: 'warning' | 'success' | 'info'; text: string }> = [];
    const latestM = approvedLogs.filter(l => l.activity_type === 'soil_moisture').sort((a, b) => b.log_date.localeCompare(a.log_date))[0];
    const latestPH = approvedLogs.filter(l => l.activity_type === 'soil_ph').sort((a, b) => b.log_date.localeCompare(a.log_date))[0];
    if (latestM) {
      if (latestM.quantity < SOIL_THRESHOLDS.moisture.low) recs.push({ type: 'warning', text: '⚠️ Đất đang khô — cần tưới nước' });
      else if (latestM.quantity > SOIL_THRESHOLDS.moisture.high) recs.push({ type: 'warning', text: '⚠️ Quá ẩm — nguy cơ phát thải CH4 cao' });
      else recs.push({ type: 'success', text: '✅ Độ ẩm đất đang tối ưu' });
    }
    if (latestPH) {
      if (latestPH.quantity < SOIL_THRESHOLDS.ph.very_low) recs.push({ type: 'warning', text: '⚠️ Đất chua — cần bón vôi cải tạo' });
      else if (latestPH.quantity >= SOIL_THRESHOLDS.ph.low && latestPH.quantity <= SOIL_THRESHOLDS.ph.optimal_high) recs.push({ type: 'success', text: '✅ Độ pH đang tối ưu' });
    }
    const fiveDaysAgo = new Date(); fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    if (!approvedLogs.some(l => new Date(l.log_date) >= fiveDaysAgo)) recs.push({ type: 'info', text: '📋 Chưa có dữ liệu cập nhật gần đây' });
    return recs;
  }, [approvedLogs]);

  const recentActivity = [...approvedLogs].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {assignedFarms.length > 1 ? (
            <select value={selectedFarmId} onChange={e => setSelectedFarmId(e.target.value)} className="text-xl font-bold text-gray-800 bg-transparent border-b-2 border-green-500 outline-none cursor-pointer pr-6">
              {assignedFarms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          ) : (
            <h2 className="text-2xl font-bold text-gray-800">{farm?.name || 'Tổng quan'}</h2>
          )}
          {farm && <p className="text-sm text-gray-500 mt-0.5">{farm.area_hectares} ha • {farm.province} • {farm.tree_count} cây {farm.coconut_variety}</p>}
        </div>
        <button onClick={() => navigate('/app/log/new')} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm shrink-0">
          <FilePlus className="w-4 h-4" /> Nhập nhật kí canh tác
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Leaf className="w-5 h-5" />} label="CO₂ hấp thụ ước tính" value={stats.absorbed} unit="tCO₂e" color="green" />
        <StatCard icon={<Factory className="w-5 h-5" />} label="CO₂ phát thải ước tính" value={stats.emitted} unit="tCO₂e" color="red" />
        <StatCard icon={<Award className="w-5 h-5" />} label="Tín chỉ carbon ước tính" value={stats.credits} unit="credits" color="teal" />
        <StatCard icon={<FileBarChart className="w-5 h-5" />} label="Trạng thái báo cáo" value={stats.latestReport?.status || 'Chưa có'} color="amber" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4"><Droplets className="w-5 h-5 text-blue-500" /><h3 className="font-semibold text-gray-800">Độ ẩm đất 30 ngày</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={moistureData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} /><Tooltip /><ReferenceArea y1={0} y2={40} fill="#fee2e2" fillOpacity={0.3} /><ReferenceArea y1={40} y2={70} fill="#dcfce7" fillOpacity={0.3} /><ReferenceArea y1={80} y2={100} fill="#ffedd5" fillOpacity={0.3} /><ReferenceLine y={40} stroke="#dc2626" strokeDasharray="3 3" /><ReferenceLine y={80} stroke="#d97706" strokeDasharray="3 3" /><Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} dot={{ r: 2 }} /></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4"><Factory className="w-5 h-5 text-red-500" /><h3 className="font-semibold text-gray-800">Phát thải theo tháng</h3></div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={emissionsData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="fuel" name="Nhiên liệu" stackId="a" fill="#ef4444" /><Bar dataKey="lime" name="Vôi" stackId="a" fill="#f59e0b" /><Bar dataKey="n2o" name="N₂O" stackId="a" fill="#8b5cf6" /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />Đề xuất canh tác hôm nay</h3>
        <div className="space-y-2">
          {recommendations.map((r, i) => (
            <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm ${r.type === 'warning' ? 'bg-amber-50 text-amber-800' : r.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>
              {r.type === 'warning' && <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
              {r.type === 'info' && <Info className="w-4 h-4 mt-0.5 shrink-0" />}
              {r.text}
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Hoạt động gần đây</h3>
        {recentActivity.length === 0 && <p className="text-sm text-gray-400">Chưa có dữ liệu</p>}
        {recentActivity.map((log, i) => (
          <div key={log.id} className={`flex items-center gap-4 py-3 text-sm ${i > 0 ? 'border-t border-gray-50' : ''}`}>
            <span className="text-xs text-gray-400 w-20 shrink-0">{log.log_date.slice(5)}</span>
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{ACTIVITY_LABELS[log.activity_type]}</span>
            <span className="font-medium">{log.quantity} {log.unit}</span>
            <span className="text-xs text-gray-400 ml-auto">{profiles.find(p => p.id === log.supervisor_id)?.full_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Manager Dashboard ─────────────────────────────────────────────────────────
function ManagerDashboard() {
  const { farms, farmingLogs, profiles, carbonReports } = useData();
  const navigate = useNavigate();

  const pendingCount = farmingLogs.filter(l => l.status === 'pending').length;
  const activeSupervisors = profiles.filter(p => p.role === 'supervisor' && p.is_active).length;
  const totalCarbon = carbonReports.reduce((sum, r) => sum + Math.max(0, r.net_carbon_ton), 0);
  const verifiedCredits = carbonReports.filter(r => r.status === 'verified').reduce((sum, r) => sum + Math.max(0, r.net_carbon_ton), 0);
  const recentLogs = [...farmingLogs].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8);

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
              <thead><tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Tên vườn</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Diện tích</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Cập nhật gần nhất</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Chờ duyệt</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Carbon ước tính</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Báo cáo</th>
              </tr></thead>
              <tbody>
                {farms.map(farm => {
                  const pending = farmingLogs.filter(l => l.farm_id === farm.id && l.status === 'pending').length;
                  const report = carbonReports.find(r => r.farm_id === farm.id);
                  const latestLog = [...farmingLogs].filter(l => l.farm_id === farm.id).sort((a, b) => b.log_date.localeCompare(a.log_date))[0];
                  return (
                    <tr key={farm.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-3 font-medium">{farm.name}</td>
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

// ─── Main export ───────────────────────────────────────────────────────────────
export default function AppDashboard() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'manager' ? <ManagerDashboard /> : <SupervisorDashboard />;
}
