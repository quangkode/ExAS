import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeft, Printer, TreePalm, FileCheck } from 'lucide-react';
import { EMISSION_FACTORS } from '../../data/constants';

export default function ExportReport() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { carbonReports, getFarm, getFarmSOC, getFarmFossil, getFarmLime, getFarmFertilizer } = useData();

  const report = carbonReports.find(r => r.id === reportId);
  if (!report) return <div className="p-8 text-gray-500">Không tìm thấy báo cáo.</div>;

  const farm = getFarm(report.farm_id);
  const soc = getFarmSOC(report.farm_id);
  const fossil = getFarmFossil(report.farm_id);
  const lime = getFarmLime(report.farm_id);
  const fert = getFarmFertilizer(report.farm_id);
  const co2Absorbed = (report.soc_change_ton * EMISSION_FACTORS.C_TO_CO2).toFixed(3);
  const totalEmissions = (report.fossil_co2_ton + report.lime_co2_ton + report.fertilizer_n2o_ton).toFixed(3);

  return (
    <div className="page-enter max-w-4xl mx-auto">
      <div className="no-print flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 cursor-pointer">
          <ArrowLeft size={16} /> Quay lại
        </button>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold text-sm shadow-lg cursor-pointer">
          <Printer size={16} /> In / Xuất PDF
        </button>
      </div>

      {/* PDF Content */}
      <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-8 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="text-center border-b-2 border-green-600 pb-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <TreePalm size={32} className="text-green-700" />
            <h1 className="text-2xl font-bold text-green-800">CocoCarbon MRV</h1>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">BÁO CÁO TÍN CHỈ CARBON</h2>
          <p className="text-sm text-gray-500 mt-1">Hệ thống Đo lường, Báo cáo và Xác minh (MRV)</p>
        </div>

        {/* Project info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="space-y-2">
            <p><strong>Tên vườn:</strong> {farm?.name}</p>
            <p><strong>Địa chỉ:</strong> {farm?.location}</p>
            <p><strong>Diện tích:</strong> {farm?.area_hectares} ha</p>
            <p><strong>Giống dừa:</strong> {farm?.coconut_variety}</p>
          </div>
          <div className="space-y-2">
            <p><strong>Mùa vụ:</strong> {report.season_name}</p>
            <p><strong>Giai đoạn:</strong> {report.season_start} → {report.season_end}</p>
            <p><strong>Trạng thái:</strong> <StatusBadge status={report.status} /></p>
            <p><strong>Tiêu chuẩn:</strong> Verra VCS VM0042</p>
          </div>
        </div>

        {/* Carbon summary table */}
        <h3 className="text-base font-bold text-gray-800 mb-3 border-b pb-2">1. Tổng kết tín chỉ Carbon</h3>
        <table className="w-full text-sm mb-6 border border-gray-200">
          <thead><tr className="bg-green-50">
            <th className="border border-gray-200 px-4 py-2 text-left">Hạng mục</th>
            <th className="border border-gray-200 px-4 py-2 text-right">Giá trị</th>
            <th className="border border-gray-200 px-4 py-2 text-left">Đơn vị</th>
          </tr></thead>
          <tbody>
            <tr><td className="border border-gray-200 px-4 py-2">Thay đổi SOC</td><td className="border border-gray-200 px-4 py-2 text-right font-semibold">{report.soc_change_ton}</td><td className="border border-gray-200 px-4 py-2">tấn C/ha</td></tr>
            <tr className="bg-green-50"><td className="border border-gray-200 px-4 py-2 font-semibold text-green-700">CO₂ hấp thụ (SOC × 3.67)</td><td className="border border-gray-200 px-4 py-2 text-right font-bold text-green-700">{co2Absorbed}</td><td className="border border-gray-200 px-4 py-2">tấn CO₂e</td></tr>
            <tr><td className="border border-gray-200 px-4 py-2">CO₂ từ nhiên liệu hóa thạch</td><td className="border border-gray-200 px-4 py-2 text-right">{report.fossil_co2_ton}</td><td className="border border-gray-200 px-4 py-2">tấn CO₂</td></tr>
            <tr><td className="border border-gray-200 px-4 py-2">CO₂ từ vôi/dolomite</td><td className="border border-gray-200 px-4 py-2 text-right">{report.lime_co2_ton}</td><td className="border border-gray-200 px-4 py-2">tấn CO₂</td></tr>
            <tr><td className="border border-gray-200 px-4 py-2">N₂O từ phân bón</td><td className="border border-gray-200 px-4 py-2 text-right">{report.fertilizer_n2o_ton}</td><td className="border border-gray-200 px-4 py-2">tấn CO₂e</td></tr>
            <tr className="bg-red-50"><td className="border border-gray-200 px-4 py-2 font-semibold text-red-600">Tổng phát thải</td><td className="border border-gray-200 px-4 py-2 text-right font-bold text-red-600">{totalEmissions}</td><td className="border border-gray-200 px-4 py-2">tấn CO₂e</td></tr>
            <tr className="bg-teal-50"><td className="border border-gray-200 px-4 py-2 font-bold text-teal-700">TÍN CHỈ CARBON RÒNG</td><td className="border border-gray-200 px-4 py-2 text-right font-bold text-teal-700 text-lg">{report.net_carbon_ton?.toFixed(3)}</td><td className="border border-gray-200 px-4 py-2 font-bold">tCO₂e</td></tr>
          </tbody>
        </table>

        {/* Methodology */}
        <h3 className="text-base font-bold text-gray-800 mb-3 border-b pb-2">2. Phương pháp tính toán</h3>
        <div className="text-xs text-gray-600 space-y-1.5 mb-6 bg-gray-50 p-4 rounded-xl">
          <p>• <strong>CO₂ hấp thụ</strong> = Δ SOC × 3.67 (tỷ lệ phân tử C → CO₂)</p>
          <p>• <strong>CO₂ nhiên liệu</strong> = Σ (lít × hệ số) | Xăng: 2.31 kg CO₂/L, Diesel: 2.68 kg CO₂/L</p>
          <p>• <strong>CO₂ vôi</strong> = Σ (kg × hệ số) | CaCO₃: 0.44, Dolomite: 0.477 kg CO₂/kg</p>
          <p>• <strong>N₂O phân bón</strong> = Σ (kg_N × 1% × 44/28 × GWP 298) — IPCC Tier 1</p>
          <p>• <strong>Tín chỉ ròng</strong> = CO₂ hấp thụ − Tổng phát thải (1 tín chỉ = 1 tCO₂e)</p>
        </div>

        {/* SOC data */}
        <h3 className="text-base font-bold text-gray-800 mb-3 border-b pb-2">3. Dữ liệu SOC</h3>
        <table className="w-full text-xs mb-6 border border-gray-200">
          <thead><tr className="bg-gray-50">
            <th className="border border-gray-200 px-3 py-1.5 text-left">Thời điểm</th>
            <th className="border border-gray-200 px-3 py-1.5">Mẫu</th>
            <th className="border border-gray-200 px-3 py-1.5">Độ sâu</th>
            <th className="border border-gray-200 px-3 py-1.5">SOC (tấn C/ha)</th>
            <th className="border border-gray-200 px-3 py-1.5 text-left">PTN</th>
          </tr></thead>
          <tbody>{soc.map(s => (
            <tr key={s.id}>
              <td className="border border-gray-200 px-3 py-1.5">{s.season === 'start' ? 'Đầu vụ' : 'Cuối vụ'} — {s.measurement_date}</td>
              <td className="border border-gray-200 px-3 py-1.5 text-center">{s.sample_id}</td>
              <td className="border border-gray-200 px-3 py-1.5 text-center">{s.depth_cm}cm</td>
              <td className="border border-gray-200 px-3 py-1.5 text-center font-bold">{s.soc_value_ton_per_ha}</td>
              <td className="border border-gray-200 px-3 py-1.5">{s.lab_name}</td>
            </tr>
          ))}</tbody>
        </table>

        {/* Verification section */}
        <h3 className="text-base font-bold text-gray-800 mb-3 border-b pb-2">4. Xác minh</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6">
          {report.status === 'verified' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <FileCheck size={20} />
                <span className="font-bold">ĐÃ XÁC MINH</span>
              </div>
              <p className="text-sm"><strong>Kiểm định viên:</strong> {user?.name || 'Kiểm định viên'}</p>
              <p className="text-sm"><strong>Ngày xác minh:</strong> {report.verified_at}</p>
              <p className="text-sm"><strong>Ghi chú:</strong> {report.verifier_notes}</p>
            </div>
          ) : (
            <div className="space-y-4 text-gray-400">
              <p className="text-sm font-medium">Chữ ký kiểm định viên:</p>
              <div className="border-b border-gray-300 w-64 h-8" />
              <p className="text-sm">Ngày: _______________</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          © CocoCarbon MRV — Dự án tín chỉ carbon cho cây dừa Việt Nam — Tạo ngày {report.created_at}
        </p>
      </div>
    </div>
  );
}
