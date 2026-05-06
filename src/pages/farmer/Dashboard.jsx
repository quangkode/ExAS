import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { EMISSION_FACTORS, MOISTURE_THRESHOLDS, PH_THRESHOLDS } from '../../data/constants';
import {
  Leaf, Factory, Trophy, BarChart3, Droplets, AlertTriangle,
  CheckCircle, ClipboardList, Sun, CloudRain, Sprout
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine,
  ReferenceArea
} from 'recharts';
import { format, parseISO, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const { getFarmerFarm, getFarmSensors, getLatestSensor, getFarmReports, monthlyEmissions } = useData();

  const farm = getFarmerFarm(user.id);
  const sensors = getFarmSensors(farm?.id);
  const latestSensor = getLatestSensor(farm?.id);
  const reports = getFarmReports(farm?.id);

  // Compute stats
  const stats = useMemo(() => {
    const latestVerified = reports.find(r => r.status === 'verified');
    const latestReport = reports[0];
    const socAbsorbed = latestReport?.soc_change_ton
      ? (latestReport.soc_change_ton * EMISSION_FACTORS.C_TO_CO2).toFixed(2)
      : '0.00';
    const totalEmissions = latestReport
      ? (latestReport.fossil_co2_ton + latestReport.lime_co2_ton + latestReport.fertilizer_n2o_ton).toFixed(3)
      : '0.000';
    const netCarbon = latestReport?.net_carbon_ton?.toFixed(2) || '0.00';
    const reportStatus = latestReport?.status || 'draft';
    return { socAbsorbed, totalEmissions, netCarbon, reportStatus };
  }, [reports]);

  // Prepare chart data - last 30 days soil moisture
  const moistureChartData = useMemo(() => {
    return sensors
      .slice()
      .sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date))
      .slice(-30)
      .map(s => ({
        date: format(parseISO(s.recorded_date), 'dd/MM'),
        moisture: s.moisture_percent,
        ph: s.ph_value,
      }));
  }, [sensors]);

  // Smart recommendations
  const recommendations = useMemo(() => {
    const recs = [];
    if (!latestSensor) {
      recs.push({
        type: 'warning',
        icon: ClipboardList,
        text: 'Chưa có dữ liệu — hãy bắt đầu nhập số liệu đo lường',
      });
      return recs;
    }

    const daysSinceLastReading = differenceInDays(new Date(), parseISO(latestSensor.recorded_date));

    if (daysSinceLastReading >= 3) {
      recs.push({
        type: 'warning',
        icon: ClipboardList,
        text: `📋 Chưa có dữ liệu mới trong ${daysSinceLastReading} ngày — nhắc nhở nhập số liệu`,
      });
    }

    if (latestSensor.moisture_percent < MOISTURE_THRESHOLDS.DRY) {
      recs.push({
        type: 'danger',
        icon: Sun,
        text: `⚠️ Đất đang khô (${latestSensor.moisture_percent}%) — cần tưới nước ngay`,
      });
    } else if (latestSensor.moisture_percent > MOISTURE_THRESHOLDS.WET) {
      recs.push({
        type: 'danger',
        icon: CloudRain,
        text: `⚠️ Đất quá ẩm (${latestSensor.moisture_percent}%) — nguy cơ phát thải cao, dừng tưới`,
      });
    } else {
      recs.push({
        type: 'success',
        icon: Droplets,
        text: `✅ Độ ẩm đất đang ở mức tối ưu (${latestSensor.moisture_percent}%)`,
      });
    }

    if (latestSensor.ph_value < PH_THRESHOLDS.ACIDIC) {
      recs.push({
        type: 'danger',
        icon: AlertTriangle,
        text: `⚠️ pH thấp (${latestSensor.ph_value}) — cần bón vôi cải tạo đất`,
      });
    } else if (latestSensor.ph_value >= PH_THRESHOLDS.LOW_OPTIMAL && latestSensor.ph_value <= PH_THRESHOLDS.HIGH_OPTIMAL) {
      recs.push({
        type: 'success',
        icon: CheckCircle,
        text: `✅ Độ pH đất đang ở mức tối ưu (${latestSensor.ph_value})`,
      });
    }

    if (recs.length === 0) {
      recs.push({
        type: 'success',
        icon: Sprout,
        text: '✅ Vườn dừa đang trong điều kiện tốt. Tiếp tục duy trì!',
      });
    }

    return recs;
  }, [latestSensor]);

  const recColorMap = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
  };

  if (!farm) return <div className="p-8 text-gray-500">Không tìm thấy thông tin vườn.</div>;

  return (
    <div className="page-enter max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{farm.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {farm.location} • {farm.area_hectares} ha • {farm.tree_count} cây dừa
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-green-200 shadow-sm">
            <p className="text-xs text-gray-500">Mùa vụ hiện tại</p>
            <p className="text-sm font-semibold text-green-700">Vụ Đông Xuân 2025</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Leaf size={20} />}
          label="Tổng CO₂ hấp thụ"
          value={stats.socAbsorbed}
          unit="tấn CO₂e"
          color="green"
          subtitle="Từ thay đổi SOC mùa vụ"
        />
        <StatCard
          icon={<Factory size={20} />}
          label="Tổng CO₂ phát thải"
          value={stats.totalEmissions}
          unit="tấn CO₂e"
          color="red"
          subtitle="Nhiên liệu + Vôi + N₂O"
        />
        <StatCard
          icon={<Trophy size={20} />}
          label="Tín chỉ carbon ước tính"
          value={stats.netCarbon}
          unit="tCO₂e"
          color="teal"
          subtitle="= Hấp thụ − Phát thải"
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          label="Trạng thái báo cáo"
          value={<StatusBadge status={stats.reportStatus} />}
          color="blue"
          subtitle="Báo cáo gần nhất"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Moisture chart */}
        <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Droplets size={16} className="text-blue-500" />
            Độ ẩm đất — 30 ngày qua
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={moistureChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#9ca3af" unit="%" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
                formatter={(v) => [`${v}%`, 'Độ ẩm']}
              />
              {/* Optimal zone */}
              <ReferenceArea y1={40} y2={70} fill="#22c55e" fillOpacity={0.08} />
              {/* Danger zone */}
              <ReferenceArea y1={80} y2={100} fill="#ef4444" fillOpacity={0.06} />
              {/* Dry zone */}
              <ReferenceArea y1={0} y2={40} fill="#3b82f6" fillOpacity={0.05} />
              <ReferenceLine y={40} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.5} />
              <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="4 4" strokeOpacity={0.5} />
              <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Line
                type="monotone"
                dataKey="moisture"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#0d9488' }}
                activeDot={{ r: 5, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-blue-100 inline-block" /> &lt;40% Khô</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-green-100 inline-block" /> 40-70% Tối ưu</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-red-100 inline-block" /> &gt;80% Quá ẩm</span>
          </div>
        </div>

        {/* Emissions bar chart */}
        <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Factory size={16} className="text-amber-500" />
            Phát thải hàng tháng (tấn CO₂e)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyEmissions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13 }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
              <Bar dataKey="fossil" name="Nhiên liệu" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
              <Bar dataKey="lime" name="Vôi" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
              <Bar dataKey="fertilizer" name="Phân bón N₂O" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm card-accent">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sprout size={16} className="text-green-600" />
          🌾 Đề xuất canh tác hôm nay
        </h3>
        <div className="space-y-3">
          {recommendations.map((rec, i) => {
            const Icon = rec.icon;
            return (
              <div
                key={i}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${recColorMap[rec.type]}`}
              >
                <Icon size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium">{rec.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
