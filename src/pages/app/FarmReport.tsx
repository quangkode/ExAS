import { useMemo } from 'react';
import { useAuth, useData } from '@/context/AppContext';
import { ACTIVITY_LABELS } from '@/lib/constants';
import { BarChart3, TreePalm, Droplets, Sprout } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';

export default function FarmReport() {
  const { user } = useAuth();
  const { farms, farmingLogs, profiles } = useData();
  if (!user) return null;

  const visibleFarms = user.role === 'manager' ? farms : farms.filter(f => user.assigned_farm_ids.includes(f.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2"><BarChart3 className="w-6 h-6 text-green-600" /><h2 className="text-2xl font-bold text-gray-800">Báo cáo vườn</h2></div>

      {visibleFarms.map(farm => {
        const farmer = profiles.find(p => p.id === farm.farmer_id);
        const approvedLogs = farmingLogs.filter(l => l.farm_id === farm.id && l.status === 'approved');
        const moistureData = approvedLogs.filter(l => l.activity_type === 'soil_moisture').sort((a, b) => a.log_date.localeCompare(b.log_date)).slice(-30).map(l => ({ date: l.log_date.slice(5), value: l.quantity }));
        const phData = approvedLogs.filter(l => l.activity_type === 'soil_ph').sort((a, b) => a.log_date.localeCompare(b.log_date)).slice(-30).map(l => ({ date: l.log_date.slice(5), value: l.quantity }));
        const latestMoisture = approvedLogs.filter(l => l.activity_type === 'soil_moisture').sort((a, b) => b.log_date.localeCompare(a.log_date))[0];
        const latestPH = approvedLogs.filter(l => l.activity_type === 'soil_ph').sort((a, b) => b.log_date.localeCompare(a.log_date))[0];

        return (
          <div key={farm.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><TreePalm className="w-5 h-5 text-green-600" />{farm.name}</h3>
                <p className="text-sm text-gray-500">{farm.location} • {farm.province} • {farm.area_hectares} ha • {farm.tree_count} cây {farm.coconut_variety}</p>
                <p className="text-sm text-gray-400">Nông hộ: {farmer?.full_name}</p>
              </div>
              <div className="flex gap-4 text-sm">
                {latestMoisture && <div className="flex items-center gap-1"><Droplets className="w-4 h-4 text-blue-400" /><span className="font-medium">{latestMoisture.quantity.toFixed(1)}%</span></div>}
                {latestPH && <div className="flex items-center gap-1"><Sprout className="w-4 h-4 text-green-400" /><span className="font-medium">pH {latestPH.quantity.toFixed(1)}</span></div>}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Độ ẩm đất</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={moistureData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 10 }} /><Tooltip /><ReferenceArea y1={0} y2={40} fill="#fee2e2" fillOpacity={0.3} /><ReferenceArea y1={40} y2={70} fill="#dcfce7" fillOpacity={0.3} /><ReferenceArea y1={80} y2={100} fill="#ffedd5" fillOpacity={0.3} /><Line type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} dot={false} /></LineChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">pH đất</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={phData}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis domain={[4, 8]} tick={{ fontSize: 10 }} /><Tooltip /><ReferenceLine y={5.5} stroke="#16a34a" strokeDasharray="3 3" /><ReferenceLine y={7} stroke="#16a34a" strokeDasharray="3 3" /><Line type="monotone" dataKey="value" stroke="#d97706" strokeWidth={2} dot={false} /></LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
