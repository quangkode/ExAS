import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { EMISSION_FACTORS } from '../../data/constants';
import { FileText, Plus, Send, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const PIE_COLORS = ['#f97316', '#eab308', '#a855f7'];

export default function CarbonReports() {
  const { user } = useAuth();
  const {
    getFarmerFarm, getFarmReports, getFarmSOC, getFarmFossil, getFarmLime, getFarmFertilizer,
    addCarbonReport, submitReport
  } = useData();

  const farm = getFarmerFarm(user.id);
  const reports = getFarmReports(farm?.id);
  const socData = getFarmSOC(farm?.id);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Auto-calculate from existing data
  const calcData = useMemo(() => {
    const fossilAll = getFarmFossil(farm?.id);
    const limeAll = getFarmLime(farm?.id);
    const fertAll = getFarmFertilizer(farm?.id);

    // SOC change
    const startSOC = socData.find(s => s.season === 'start');
    const endSOC = socData.find(s => s.season === 'end');
    const socChange = startSOC && endSOC ? endSOC.soc_value_ton_per_ha - startSOC.soc_value_ton_per_ha : 0;
    const co2Absorbed = socChange * EMISSION_FACTORS.C_TO_CO2;

    // Fossil fuel emissions
    const fossilCO2 = fossilAll.reduce((sum, f) => {
      const factor = EMISSION_FACTORS.FOSSIL[f.fuel_type] || 2.5;
      return sum + (f.quantity_liters * factor / 1000);
    }, 0);

    // Lime emissions
    const limeCO2 = limeAll.reduce((sum, l) => {
      const factor = EMISSION_FACTORS.LIME[l.lime_type] || 0.44;
      return sum + (l.quantity_kg * factor / 1000);
    }, 0);

    // N2O from fertilizer
    const fertN2O = fertAll.reduce((sum, f) => {
      const nInput = f.quantity_kg * (f.nitrogen_content_percent / 100);
      const n2oN = nInput * EMISSION_FACTORS.N2O_EMISSION_FACTOR;
      const n2o = n2oN * (44 / 28);
      const co2e = n2o * EMISSION_FACTORS.N2O_GWP / 1000;
      return sum + co2e;
    }, 0);

    const totalEmissions = fossilCO2 + limeCO2 + fertN2O;
    const netCarbon = co2Absorbed - totalEmissions;

    return {
      socChange: Math.round(socChange * 1000) / 1000,
      co2Absorbed: Math.round(co2Absorbed * 1000) / 1000,
      fossilCO2: Math.round(fossilCO2 * 1000) / 1000,
      limeCO2: Math.round(limeCO2 * 1000) / 1000,
      fertN2O: Math.round(fertN2O * 1000) / 1000,
      totalEmissions: Math.round(totalEmissions * 1000) / 1000,
      netCarbon: Math.round(netCarbon * 1000) / 1000,
    };
  }, [farm, socData, getFarmFossil, getFarmLime, getFarmFertilizer]);

  const handleCreateReport = () => {
    addCarbonReport({
      farm_id: farm.id,
      season_start: '2025-01-01',
      season_end: '2025-06-30',
      season_name: 'Vụ Đông Xuân 2025',
      soc_change_ton: calcData.socChange,
      fossil_co2_ton: calcData.fossilCO2,
      lime_co2_ton: calcData.limeCO2,
      fertilizer_n2o_ton: calcData.fertN2O,
      net_carbon_ton: calcData.netCarbon,
    });
    setShowCreate(false);
  };

  const pieData = selectedReport ? [
    { name: 'Nhiên liệu', value: selectedReport.fossil_co2_ton },
    { name: 'Vôi', value: selectedReport.lime_co2_ton },
    { name: 'Phân bón N₂O', value: selectedReport.fertilizer_n2o_ton },
  ] : [];

  return (
    <div className="page-enter max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={24} className="text-green-600" /> Báo cáo Carbon
          </h1>
          <p className="text-sm text-gray-500 mt-1">Tạo và quản lý báo cáo tín chỉ carbon</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-medium text-sm shadow-lg shadow-green-200 hover:shadow-xl transition-all cursor-pointer">
          <Plus size={16} /> Tạo báo cáo mới
        </button>
      </div>

      {/* Create report panel */}
      {showCreate && (
        <div className="bg-white rounded-2xl border-2 border-green-200 p-6 shadow-sm mb-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">📊 Tính toán tự động từ dữ liệu hiện tại</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Thay đổi SOC</p>
              <p className="text-lg font-bold text-green-700">{calcData.socChange}</p>
              <p className="text-[10px] text-gray-400">tấn C/ha</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">CO₂ hấp thụ</p>
              <p className="text-lg font-bold text-green-700">{calcData.co2Absorbed}</p>
              <p className="text-[10px] text-gray-400">tấn CO₂e</p>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Tổng phát thải</p>
              <p className="text-lg font-bold text-red-600">{calcData.totalEmissions}</p>
              <p className="text-[10px] text-gray-400">tấn CO₂e</p>
            </div>
            <div className="bg-teal-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Tín chỉ ước tính</p>
              <p className="text-lg font-bold text-teal-700">{calcData.netCarbon}</p>
              <p className="text-[10px] text-gray-400">tCO₂e</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-xs text-gray-600 space-y-1">
            <p><strong>Phương pháp tính:</strong></p>
            <p>• CO₂ hấp thụ = SOC_change × 3.67 (tỷ lệ C → CO₂)</p>
            <p>• CO₂ nhiên liệu: Xăng 2.31 kg/L, Diesel 2.68 kg/L</p>
            <p>• CO₂ vôi: CaCO₃ × 0.44, Dolomite × 0.477</p>
            <p>• N₂O = N_input × 1% × 44/28 × GWP(298)</p>
          </div>
          <button onClick={handleCreateReport}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold text-sm shadow-lg cursor-pointer hover:opacity-90 transition">
            📝 Tạo báo cáo (Bản nháp)
          </button>
        </div>
      )}

      {/* Reports list */}
      <div className="space-y-4">
        {reports.map(report => (
          <div key={report.id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden cursor-pointer transition-all hover:shadow-md ${
              selectedReport?.id === report.id ? 'border-green-400 ring-2 ring-green-200' : 'border-green-100'
            }`}
            onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{report.season_name || `${report.season_start} — ${report.season_end}`}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{report.season_start} → {report.season_end}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={report.status} />
                  {report.status === 'draft' && (
                    <button onClick={(e) => { e.stopPropagation(); submitReport(report.id); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 cursor-pointer">
                      <Send size={12} /> Gửi kiểm định
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Hấp thụ</p>
                    <p className="font-semibold text-green-700 text-sm">{(report.soc_change_ton * 3.67).toFixed(2)} tCO₂e</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown size={14} className="text-red-500" />
                  <div>
                    <p className="text-xs text-gray-500">Phát thải</p>
                    <p className="font-semibold text-red-600 text-sm">{(report.fossil_co2_ton + report.lime_co2_ton + report.fertilizer_n2o_ton).toFixed(3)} tCO₂e</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Minus size={14} className="text-teal-600" />
                  <div>
                    <p className="text-xs text-gray-500">Tín chỉ</p>
                    <p className="font-bold text-teal-700 text-sm">{report.net_carbon_ton?.toFixed(2)} tCO₂e</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded detail */}
            {selectedReport?.id === report.id && (
              <div className="border-t border-green-100 p-5 bg-green-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Chi tiết phát thải</h5>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-600">Nhiên liệu hóa thạch</td><td className="py-1.5 font-semibold text-right">{report.fossil_co2_ton} tCO₂</td></tr>
                        <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-600">Vôi / Dolomite</td><td className="py-1.5 font-semibold text-right">{report.lime_co2_ton} tCO₂</td></tr>
                        <tr className="border-b border-gray-100"><td className="py-1.5 text-gray-600">N₂O phân bón</td><td className="py-1.5 font-semibold text-right">{report.fertilizer_n2o_ton} tCO₂e</td></tr>
                      </tbody>
                    </table>
                    {report.verifier_notes && (
                      <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 mb-1">📝 Ghi chú kiểm định viên:</p>
                        <p className="text-xs text-blue-800">{report.verifier_notes}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-3">Tỷ lệ phát thải</h5>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={4}>
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v) => `${v} tCO₂e`} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
