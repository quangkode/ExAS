import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { History as HistoryIcon, Droplets, Fuel, Mountain, Sprout, Search } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { EQUIPMENT_OPTIONS, FUEL_OPTIONS, LIME_OPTIONS, FERTILIZER_OPTIONS } from '../../data/constants';

const TABS = [
  { id: 'soil', label: 'Độ ẩm & pH', icon: Droplets },
  { id: 'fossil', label: 'Nhiên liệu', icon: Fuel },
  { id: 'lime', label: 'Vôi', icon: Mountain },
  { id: 'fertilizer', label: 'Phân bón', icon: Sprout },
];

export default function MeasurementHistory() {
  const [activeTab, setActiveTab] = useState('soil');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const { getFarmerFarm, getFarmSensors, getFarmFossil, getFarmLime, getFarmFertilizer } = useData();
  const farm = getFarmerFarm(user.id);

  const soilData = getFarmSensors(farm?.id);
  const fossilData = getFarmFossil(farm?.id);
  const limeDataArr = getFarmLime(farm?.id);
  const fertData = getFarmFertilizer(farm?.id);

  const eqLabel = (v) => EQUIPMENT_OPTIONS.find(o => o.value === v)?.label || v;
  const fuelLabel = (v) => FUEL_OPTIONS.find(o => o.value === v)?.label || v;
  const limeLabel = (v) => LIME_OPTIONS.find(o => o.value === v)?.label || v;
  const fertLabel = (v) => FERTILIZER_OPTIONS.find(o => o.value === v)?.label || v;

  // pH chart data
  const phChartData = useMemo(() => {
    return soilData.slice().sort((a, b) => new Date(a.recorded_date) - new Date(b.recorded_date)).slice(-30).map(s => ({
      date: format(parseISO(s.recorded_date), 'dd/MM'),
      ph: s.ph_value,
    }));
  }, [soilData]);

  return (
    <div className="page-enter max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <HistoryIcon size={24} className="text-green-600" /> Lịch sử đo lường
      </h1>
      <p className="text-sm text-gray-500 mb-6">Xem lại toàn bộ dữ liệu đã ghi nhận</p>

      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              activeTab === t.id ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <t.icon size={16} />{t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo ngày..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-green-500 outline-none" />
      </div>

      {activeTab === 'soil' && (
        <>
          <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Biến động pH — 30 ngày</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={phChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis domain={[4, 8]} tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="ph" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Ngày</th><th className="pb-2 font-medium">Độ ẩm (%)</th>
                <th className="pb-2 font-medium">pH</th><th className="pb-2 font-medium">Phương pháp</th>
              </tr></thead>
              <tbody>{soilData.filter(s => !search || s.recorded_date.includes(search)).map(s => (
                <tr key={s.id} className="border-b border-gray-50 table-row-hover">
                  <td className="py-2">{s.recorded_date}</td><td>{s.moisture_percent}%</td>
                  <td>{s.ph_value}</td><td className="text-xs text-gray-500">{s.input_method === 'sensor' ? '📡 Cảm biến' : '✍️ Nhập tay'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'fossil' && (
        <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium">Ngày</th><th className="pb-2 font-medium">Thiết bị</th>
              <th className="pb-2 font-medium">Nhiên liệu</th><th className="pb-2 font-medium">Số lít</th>
              <th className="pb-2 font-medium">Hóa đơn</th>
            </tr></thead>
            <tbody>{fossilData.filter(f => !search || f.recorded_date.includes(search)).map(f => (
              <tr key={f.id} className="border-b border-gray-50 table-row-hover">
                <td className="py-2">{f.recorded_date}</td><td>{eqLabel(f.equipment_type)}</td>
                <td>{fuelLabel(f.fuel_type)}</td><td className="font-semibold">{f.quantity_liters}L</td>
                <td className="text-xs text-gray-500">{f.invoice_ref || '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {activeTab === 'lime' && (
        <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium">Ngày</th><th className="pb-2 font-medium">Loại</th>
              <th className="pb-2 font-medium">Khối lượng</th><th className="pb-2 font-medium">Diện tích</th>
              <th className="pb-2 font-medium">Hóa đơn</th>
            </tr></thead>
            <tbody>{limeDataArr.filter(l => !search || l.recorded_date.includes(search)).map(l => (
              <tr key={l.id} className="border-b border-gray-50 table-row-hover">
                <td className="py-2">{l.recorded_date}</td><td>{limeLabel(l.lime_type)}</td>
                <td className="font-semibold">{l.quantity_kg} kg</td><td>{l.application_area_ha} ha</td>
                <td className="text-xs text-gray-500">{l.invoice_ref || '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {activeTab === 'fertilizer' && (
        <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium">Ngày</th><th className="pb-2 font-medium">Loại</th>
              <th className="pb-2 font-medium">Sản phẩm</th><th className="pb-2 font-medium">N%</th>
              <th className="pb-2 font-medium">Kg</th><th className="pb-2 font-medium">Ghi chú</th>
            </tr></thead>
            <tbody>{fertData.filter(f => !search || f.recorded_date.includes(search)).map(f => (
              <tr key={f.id} className="border-b border-gray-50 table-row-hover">
                <td className="py-2">{f.recorded_date}</td><td>{fertLabel(f.fertilizer_type)}</td>
                <td className="font-medium">{f.product_name}</td><td>{f.nitrogen_content_percent}%</td>
                <td className="font-semibold">{f.quantity_kg}</td>
                <td className="text-xs text-gray-500 max-w-[200px] truncate">{f.application_notes || '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
