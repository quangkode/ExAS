import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import {
  ArrowLeft, TreePalm, MapPin, Droplets, Fuel, Mountain,
  Sprout, CheckCircle, XCircle, FileText, Printer,
  AlertTriangle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';

export default function FarmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getFarm, getFarmSensors, getFarmFossil, getFarmLime,
    getFarmFertilizer, getFarmSOC, getFarmReports, verifyReport
  } = useData();

  const farm = getFarm(id);
  const sensors = getFarmSensors(id);
  const fossil = getFarmFossil(id);
  const lime = getFarmLime(id);
  const fert = getFarmFertilizer(id);
  const soc = getFarmSOC(id);
  const reports = getFarmReports(id);

  const [verifyNotes, setVerifyNotes] = useState('');
  const [activeReportId, setActiveReportId] = useState(null);

  if (!farm) return <div className="p-8 text-gray-500">Không tìm thấy vườn dừa.</div>;

  const moistureData = sensors
    .slice().sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date))
    .slice(-30).map(s => ({
      date: format(parseISO(s.recorded_date), 'dd/MM'),
      moisture: s.moisture_percent,
      ph: s.ph_value,
    }));

  // Data validation warnings
  const warnings = [];
  if (sensors.length < 10) warnings.push('Dữ liệu cảm biến đất ít hơn 10 bản ghi');
  if (fossil.length === 0) warnings.push('Chưa có dữ liệu nhiên liệu hóa thạch');
  if (soc.length < 2) warnings.push('Chưa đủ dữ liệu SOC đầu/cuối vụ');

  const handleVerify = (reportId, approved) => {
    verifyReport(reportId, user.id, verifyNotes || (approved ? 'Đã xác minh — dữ liệu đầy đủ' : 'Từ chối — thiếu dữ liệu'), approved);
    setVerifyNotes('');
    setActiveReportId(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-enter max-w-6xl mx-auto">
      {/* Back button */}
      <button onClick={() => navigate('/verifier/dashboard')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 mb-4 cursor-pointer no-print">
        <ArrowLeft size={16} /> Quay lại tổng quan
      </button>

      {/* Farm header */}
      <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-lg">
              <TreePalm size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{farm.name}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin size={13} /> {farm.location}
              </p>
              <div className="flex gap-4 mt-2 text-xs text-gray-600">
                <span>📐 {farm.area_hectares} ha</span>
                <span>🌴 {farm.tree_count} cây</span>
                <span>🌱 {farm.coconut_variety}</span>
                <span>📅 Trồng năm {farm.planting_year}</span>
              </div>
            </div>
          </div>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition cursor-pointer no-print">
            <Printer size={16} /> Xuất PDF
          </button>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 no-print">
          <h4 className="text-sm font-semibold text-amber-800 flex items-center gap-1.5 mb-2">
            <AlertTriangle size={15} /> Cảnh báo dữ liệu
          </h4>
          <ul className="space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Soil chart */}
      <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm mb-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Droplets size={16} className="text-blue-500" /> Độ ẩm đất — 30 ngày
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={moistureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#9ca3af" unit="%" />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Line type="monotone" dataKey="moisture" stroke="#0d9488" strokeWidth={2} dot={{ r: 2 }} name="Độ ẩm %" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Data summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-green-100 p-4 text-center shadow-sm">
          <Droplets size={20} className="text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-800">{sensors.length}</p>
          <p className="text-xs text-gray-500">Bản ghi đất</p>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-4 text-center shadow-sm">
          <Fuel size={20} className="text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-800">{fossil.length}</p>
          <p className="text-xs text-gray-500">Nhiên liệu</p>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-4 text-center shadow-sm">
          <Mountain size={20} className="text-yellow-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-800">{lime.length}</p>
          <p className="text-xs text-gray-500">Vôi/Dolomite</p>
        </div>
        <div className="bg-white rounded-xl border border-green-100 p-4 text-center shadow-sm">
          <Sprout size={20} className="text-purple-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-800">{fert.length}</p>
          <p className="text-xs text-gray-500">Phân bón</p>
        </div>
      </div>

      {/* SOC Data */}
      {soc.length > 0 && (
        <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">🧪 Dữ liệu SOC (Carbon hữu cơ đất)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Thời điểm</th><th className="pb-2 font-medium">Mẫu</th>
                <th className="pb-2 font-medium">Độ sâu</th><th className="pb-2 font-medium">SOC (tấn C/ha)</th>
                <th className="pb-2 font-medium">Phòng thí nghiệm</th>
              </tr></thead>
              <tbody>{soc.map(s => (
                <tr key={s.id} className="border-b border-gray-50">
                  <td className="py-2">{s.season === 'start' ? '🟢 Đầu vụ' : '🔴 Cuối vụ'} — {s.measurement_date}</td>
                  <td>{s.sample_id}</td><td>{s.depth_cm} cm</td>
                  <td className="font-bold text-green-700">{s.soc_value_ton_per_ha}</td>
                  <td className="text-xs text-gray-500">{s.lab_name}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports with verify action */}
      <div className="bg-white rounded-2xl border border-green-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-green-100">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-green-600" /> Báo cáo Carbon
          </h3>
        </div>
        <div className="divide-y divide-gray-50">
          {reports.map(report => (
            <div key={report.id} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{report.season_name || 'Báo cáo'}</h4>
                  <p className="text-xs text-gray-500">{report.season_start} → {report.season_end}</p>
                </div>
                <StatusBadge status={report.status} />
              </div>
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="bg-green-50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-gray-500">SOC Δ</p>
                  <p className="font-bold text-green-700 text-sm">{report.soc_change_ton} t</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-gray-500">Nhiên liệu</p>
                  <p className="font-bold text-orange-600 text-sm">{report.fossil_co2_ton} t</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-gray-500">Vôi</p>
                  <p className="font-bold text-yellow-600 text-sm">{report.lime_co2_ton} t</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-gray-500">Net Carbon</p>
                  <p className="font-bold text-teal-700 text-sm">{report.net_carbon_ton?.toFixed(2)} t</p>
                </div>
              </div>

              {report.verifier_notes && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
                  <p className="text-xs text-blue-800">📝 {report.verifier_notes}</p>
                </div>
              )}

              {report.status === 'submitted' && (
                <div className="no-print">
                  {activeReportId === report.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={verifyNotes}
                        onChange={e => setVerifyNotes(e.target.value)}
                        placeholder="Ghi chú kiểm định (tùy chọn)..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-green-500 outline-none resize-none"
                        rows={2}
                      />
                      <div className="flex gap-3">
                        <button onClick={() => handleVerify(report.id, true)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition cursor-pointer">
                          <CheckCircle size={16} /> Xác minh ✅
                        </button>
                        <button onClick={() => handleVerify(report.id, false)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition cursor-pointer">
                          <XCircle size={16} /> Từ chối ❌
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setActiveReportId(report.id)}
                      className="w-full py-2.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition cursor-pointer">
                      📋 Kiểm định báo cáo này
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
