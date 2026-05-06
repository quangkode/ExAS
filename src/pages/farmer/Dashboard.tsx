import { useMemo } from 'react';
import { useAuth, useData } from '@/context/AppContext';
import StatCard from '@/components/ui/StatCard';
import { ACTIVITY_LABELS, SOIL_THRESHOLDS } from '@/lib/constants';
import { calculateFuelEmissions, calculateLimeEmissions, calculateN2OEmissions, calculateSOCAbsorption } from '@/lib/calculations';
import { Leaf, Factory, Award, FileBarChart, Droplets, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine, ReferenceArea } from 'recharts';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { farms, farmingLogs, fuelDetails, limeDetails, fertDetails, carbonReports, profiles } = useData();
  if (!user) return null;

  const farm = farms.find(f => f.farmer_id === user.id);
  if (!farm) return <div className="text-center py-20 text-gray-500">Không tìm thấy vườn</div>;

  const approvedLogs = farmingLogs.filter(l => l.farm_id === farm.id && l.status === 'approved');

  const stats = useMemo(() => {
    const socLogs = approvedLogs.filter(l => l.activity_type === 'soc_measurement');
    const startSOC = socLogs.find(l => l.notes.includes('đầu vụ'))?.quantity || 0;
    const endSOC = socLogs.find(l => l.notes.includes('cuối vụ'))?.quantity || 0;
    const absorbed = startSOC && endSOC ? calculateSOCAbsorption(startSOC, endSOC, farm.area_hectares) : 0;
    const fuelLogs = approvedLogs.filter(l => l.activity_type === 'fossil_fuel').map(l => ({ quantity: l.quantity, fuel_type: (fuelDetails.find(f => f.log_id === l.id)?.fuel_type || 'diesel') as 'gasoline' | 'diesel' }));
    const limeLogs = approvedLogs.filter(l => l.activity_type === 'lime_application').map(l => ({ quantity: l.quantity, lime_type: (limeDetails.find(f => f.log_id === l.id)?.lime_type || 'cao3') as 'cao3' | 'dolomite' }));
    const fLogs = approvedLogs.filter(l => l.activity_type === 'fertilizer').map(l => ({ quantity: l.quantity, nitrogen_percent: fertDetails.find(f => f.log_id === l.id)?.nitrogen_percent || 0 }));
    const emitted = calculateFuelEmissions(fuelLogs) + calculateLimeEmissions(limeLogs) + calculateN2OEmissions(fLogs);
    return { absorbed, emitted, credits: Math.max(0, absorbed - emitted), latestReport: carbonReports.find(r => r.farm_id === farm.id) };
  }, [approvedLogs, farm, fuelDetails, limeDetails, fertDetails, carbonReports]);

  const moistureData = useMemo(() => approvedLogs.filter(l => l.activity_type === 'soil_moisture').sort((a, b) => a.log_date.localeCompare(b.log_date)).slice(-30).map(l => ({ date: l.log_date.slice(5), value: l.quantity })), [approvedLogs]);

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
    if (latestM) { if (latestM.quantity < SOIL_THRESHOLDS.moisture.low) recs.push({ type: 'warning', text: '⚠️ Đất đang khô — cần tưới nước' }); else if (latestM.quantity > SOIL_THRESHOLDS.moisture.high) recs.push({ type: 'warning', text: '⚠️ Quá ẩm — nguy cơ phát thải CH4 cao' }); else recs.push({ type: 'success', text: '✅ Độ ẩm đất đang tối ưu' }); }
    if (latestPH) { if (latestPH.quantity < SOIL_THRESHOLDS.ph.very_low) recs.push({ type: 'warning', text: '⚠️ Đất chua — cần bón vôi cải tạo' }); else if (latestPH.quantity >= SOIL_THRESHOLDS.ph.low && latestPH.quantity <= SOIL_THRESHOLDS.ph.optimal_high) recs.push({ type: 'success', text: '✅ Độ pH đang tối ưu' }); }
    const fiveDaysAgo = new Date(); fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    if (!approvedLogs.some(l => new Date(l.log_date) >= fiveDaysAgo)) recs.push({ type: 'info', text: '📋 Chưa có dữ liệu cập nhật gần đây' });
    return recs;
  }, [approvedLogs]);

  const recentActivity = approvedLogs.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Leaf className="w-5 h-5" />} label="CO₂ hấp thụ ước tính" value={stats.absorbed} unit="tCO₂e" color="green" />
        <StatCard icon={<Factory className="w-5 h-5" />} label="CO₂ phát thải ước tính" value={stats.emitted} unit="tCO₂e" color="red" />
        <StatCard icon={<Award className="w-5 h-5" />} label="Tín chỉ carbon ước tính" value={stats.credits} unit="credits" color="teal" />
        <StatCard icon={<FileBarChart className="w-5 h-5" />} label="Trạng thái báo cáo" value={stats.latestReport?.status || 'Chưa có'} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4"><Droplets className="w-5 h-5 text-blue-500" /><h3 className="font-semibold text-gray-800">Độ ẩm đất 30 ngày</h3></div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={moistureData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} /><Tooltip /><ReferenceArea y1={0} y2={40} fill="#fee2e2" fillOpacity={0.3} /><ReferenceArea y1={40} y2={70} fill="#dcfce7" fillOpacity={0.3} /><ReferenceArea y1={80} y2={100} fill="#ffedd5" fillOpacity={0.3} /><ReferenceLine y={40} stroke="#dc2626" strokeDasharray="3 3" /><ReferenceLine y={80} stroke="#d97706" strokeDasharray="3 3" /><Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} dot={{ r: 2 }} /></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4"><Factory className="w-5 h-5 text-red-500" /><h3 className="font-semibold text-gray-800">Phát thải theo tháng</h3></div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={emissionsData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="fuel" name="Nhiên liệu" stackId="a" fill="#ef4444" /><Bar dataKey="lime" name="Vôi" stackId="a" fill="#f59e0b" /><Bar dataKey="n2o" name="N₂O" stackId="a" fill="#8b5cf6" /></BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />Đề xuất canh tác hôm nay</h3>
        <div className="space-y-2">
          {recommendations.map((r, i) => (<div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm ${r.type === 'warning' ? 'bg-amber-50 text-amber-800' : r.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-blue-50 text-blue-800'}`}>{r.type === 'warning' && <AlertTriangle className="w-4 h-4 mt-0.5" />}{r.type === 'success' && <CheckCircle className="w-4 h-4 mt-0.5" />}{r.type === 'info' && <Info className="w-4 h-4 mt-0.5" />}{r.text}</div>))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Hoạt động gần đây</h3>
        {recentActivity.map((log, i) => (<div key={log.id} className={`flex items-center gap-4 py-3 text-sm ${i > 0 ? 'border-t border-gray-50' : ''}`}><span className="text-xs text-gray-400 w-20">{log.log_date.slice(5)}</span><span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">{ACTIVITY_LABELS[log.activity_type]}</span><span className="font-medium">{log.quantity} {log.unit}</span><span className="text-xs text-gray-400 ml-auto">{profiles.find(p => p.id === log.supervisor_id)?.full_name}</span></div>))}
      </div>
    </div>
  );
}
