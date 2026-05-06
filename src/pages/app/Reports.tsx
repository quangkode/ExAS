import { useState, useMemo } from 'react';
import { useAuth, useData } from '@/context/AppContext';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import { generateCarbonCalculation } from '@/lib/calculations';
import type { CarbonReport } from '@/types';
import { FileText, Plus, Calculator, Download, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function Reports() {
  const { user } = useAuth();
  const { farms, farmingLogs, fuelDetails, limeDetails, fertDetails, socDetails, carbonReports, addCarbonReport, updateCarbonReport, showToast, addAuditEntry } = useData();
  if (!user) return null;

  const [showCreate, setShowCreate] = useState(false);
  const [selectedFarm, setSelectedFarm] = useState(farms[0]?.id || '');
  const [seasonStart, setSeasonStart] = useState('');
  const [seasonEnd, setSeasonEnd] = useState('');
  const [calculated, setCalculated] = useState<ReturnType<typeof generateCarbonCalculation> | null>(null);

  const [completenessWarning, setCompletenessWarning] = useState<string | null>(null);

  const handleCalculate = () => {
    const farm = farms.find(f => f.id === selectedFarm);
    if (!farm || !seasonStart || !seasonEnd) return;
    const approved = farmingLogs.filter(l => l.farm_id === selectedFarm && l.status === 'approved' && l.log_date >= seasonStart && l.log_date <= seasonEnd);
    const socLogs = approved.filter(l => l.activity_type === 'soc_measurement');
    const startSOC = socLogs.sort((a, b) => a.log_date.localeCompare(b.log_date))[0]?.quantity || 0;
    const endSOC = socLogs.sort((a, b) => b.log_date.localeCompare(a.log_date))[0]?.quantity || 0;
    const result = generateCarbonCalculation(approved, fuelDetails, limeDetails, fertDetails, startSOC, endSOC, farm.area_hectares);
    setCalculated(result);

    // Completeness check: expected ~2 entries/day (moisture + pH), check if >= 80%
    const start = new Date(seasonStart);
    const end = new Date(seasonEnd);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
    const uniqueDates = new Set(approved.filter(l => ['soil_moisture', 'soil_ph'].includes(l.activity_type)).map(l => l.log_date)).size;
    const completeness = totalDays > 0 ? uniqueDates / totalDays : 1;
    setCompletenessWarning(completeness < 0.8 ? `Dữ liệu chỉ đạt ${(completeness * 100).toFixed(0)}% số ngày trong vụ (${uniqueDates}/${totalDays} ngày có đo đạc). Kết quả tính toán có thể chưa chính xác.` : null);
  };

  const handleExportPDF = (r: CarbonReport) => {
    const farm = farms.find(f => f.id === r.farm_id);
    const content = `<html><head><meta charset="utf-8"><title>Báo cáo carbon - ${farm?.name}</title>
      <style>body{font-family:sans-serif;padding:40px;color:#111}h1{color:#16a34a}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f0fdf4;font-weight:600}.footer{margin-top:40px;color:#6b7280;font-size:12px}</style>
      </head><body>
      <h1>Báo cáo Carbon — ${farm?.name}</h1>
      <p>Vụ mùa: <b>${r.season_start}</b> → <b>${r.season_end}</b></p>
      <p>Diện tích: ${farm?.area_hectares} ha | Giống dừa: ${farm?.coconut_variety}</p>
      <table><tr><th>Chỉ số</th><th>Giá trị</th></tr>
      <tr><td>SOC thay đổi</td><td>${r.soc_change_tonC.toFixed(3)} tC/ha</td></tr>
      <tr><td>CO₂ hấp thụ (SOC)</td><td style="color:#16a34a">${(r.soc_change_tonC * (farm?.area_hectares || 1) * 3.67).toFixed(3)} tCO₂e</td></tr>
      <tr><td>Phát thải nhiên liệu hóa thạch</td><td style="color:#dc2626">${r.fossil_co2_ton.toFixed(4)} tCO₂e</td></tr>
      <tr><td>Phát thải từ vôi</td><td style="color:#dc2626">${r.lime_co2_ton.toFixed(4)} tCO₂e</td></tr>
      <tr><td>Phát thải N₂O (phân bón)</td><td style="color:#dc2626">${r.n2o_ton.toFixed(4)} tCO₂e</td></tr>
      <tr><td><b>Net Carbon</b></td><td><b style="color:#16a34a">${r.net_carbon_ton.toFixed(3)} tCO₂e</b></td></tr>
      <tr><td><b>Tín chỉ carbon</b></td><td><b style="color:#16a34a">${Math.max(0, r.net_carbon_ton).toFixed(3)}</b></td></tr>
      </table>
      <p class="footer">Xuất bởi CocoCarbon MRV • ${new Date().toLocaleDateString('vi-VN')}</p>
      </body></html>`;
    const win = window.open('', '_blank');
    if (win) { win.document.write(content); win.document.close(); setTimeout(() => win.print(), 500); }
  };

  const handleSave = (status: 'draft' | 'submitted') => {
    if (!calculated) return;
    const id = `report-${Date.now()}`;
    const report: CarbonReport = {
      id, farm_id: selectedFarm, season_start: seasonStart, season_end: seasonEnd,
      soc_change_tonC: calculated.soc_change_tonC, fossil_co2_ton: calculated.fossil_co2_ton,
      lime_co2_ton: calculated.lime_co2_ton, n2o_ton: calculated.n2o_ton,
      net_carbon_ton: calculated.net_carbon_ton, status, created_by: user.id,
      verifier_notes: '', created_at: new Date().toISOString(),
    };
    addCarbonReport(report);
    addAuditEntry({ user_id: user.id, user_name: user.full_name, action: 'Tạo báo cáo carbon', target_type: 'carbon_report', target_id: id, details: `${status === 'draft' ? 'Bản nháp' : 'Nộp xác minh'} — ${calculated.net_carbon_ton.toFixed(2)} tCO₂e` });
    showToast('success', status === 'draft' ? 'Đã lưu bản nháp' : 'Đã nộp báo cáo xác minh');
    setShowCreate(false);
    setCalculated(null);
  };

  const pieData = calculated ? [
    { name: 'Nhiên liệu', value: calculated.fossil_co2_ton, color: '#ef4444' },
    { name: 'Vôi', value: calculated.lime_co2_ton, color: '#f59e0b' },
    { name: 'N₂O phân bón', value: calculated.n2o_ton, color: '#8b5cf6' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><FileText className="w-6 h-6 text-green-600" /><h2 className="text-2xl font-bold text-gray-800">Báo cáo carbon</h2></div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700"><Plus className="w-4 h-4" />Tạo báo cáo mới</button>
      </div>

      {/* Reports list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Vườn</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Vụ mùa</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Net Carbon</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Tín chỉ</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Trạng thái</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Hành động</th>
          </tr></thead>
          <tbody>
            {carbonReports.map(r => {
              const farm = farms.find(f => f.id === r.farm_id);
              return (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-medium">{farm?.name}</td>
                  <td className="py-3 px-4 text-gray-600">{r.season_start} → {r.season_end}</td>
                  <td className="py-3 px-4 font-medium text-green-700">{r.net_carbon_ton.toFixed(2)} tCO₂e</td>
                  <td className="py-3 px-4 font-medium">{Math.max(0, r.net_carbon_ton).toFixed(2)}</td>
                  <td className="py-3 px-4"><StatusBadge status={r.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleExportPDF(r)} className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium"><Download className="w-3 h-3" />Xuất PDF</button>
                      {r.status === 'draft' && <button onClick={() => { updateCarbonReport(r.id, { status: 'submitted' }); showToast('success', 'Đã nộp báo cáo'); }} className="text-xs text-green-600 hover:text-green-800 font-medium">Nộp xác minh</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {carbonReports.length === 0 && <div className="text-center py-12 text-gray-400">Chưa có báo cáo</div>}
      </div>

      {/* Create Report Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); setCalculated(null); }} title="Tạo báo cáo carbon mới" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Vườn</label><select value={selectedFarm} onChange={e => setSelectedFarm(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none">{farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label><input type="date" value={seasonStart} onChange={e => setSeasonStart(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label><input type="date" value={seasonEnd} onChange={e => setSeasonEnd(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
          </div>
          <button onClick={handleCalculate} className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700"><Calculator className="w-4 h-4" />Tính toán</button>

          {completenessWarning && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{completenessWarning}</span>
            </div>
          )}

          {calculated && (
            <div className="animate-fade-in space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">Kết quả tính toán</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">SOC thay đổi:</span><span className="font-medium text-green-700">+{calculated.soc_change_tonC.toFixed(2)} tC/ha</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">CO₂ hấp thụ:</span><span className="font-medium text-green-700">{calculated.soc_absorption.toFixed(2)} tCO₂e</span></div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between"><span className="text-gray-500">Phát thải nhiên liệu:</span><span className="font-medium text-red-600">{calculated.fossil_co2_ton.toFixed(4)} tCO₂e</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Phát thải vôi:</span><span className="font-medium text-red-600">{calculated.lime_co2_ton.toFixed(4)} tCO₂e</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Phát thải N₂O:</span><span className="font-medium text-red-600">{calculated.n2o_ton.toFixed(4)} tCO₂e</span></div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-base"><span className="font-semibold">Net Carbon:</span><span className="font-bold text-green-700">{calculated.net_carbon_ton.toFixed(2)} tCO₂e</span></div>
                    <div className="flex justify-between text-base"><span className="font-semibold">Tín chỉ carbon:</span><span className="font-bold text-green-700">{calculated.credits.toFixed(2)}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Cơ cấu phát thải</h4>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart><Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80}>{pieData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie><Tooltip formatter={(v: number) => `${v.toFixed(4)} tCO₂e`} /><Legend /></PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-sm text-gray-400 text-center py-8">Không có dữ liệu phát thải</p>}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleSave('draft')} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">Lưu bản nháp</button>
                <button onClick={() => handleSave('submitted')} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700">Nộp xác minh Verra</button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
