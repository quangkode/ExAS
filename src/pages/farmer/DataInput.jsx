import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Droplets, Fuel, Mountain, Sprout, Trash2, Calendar,
  Gauge, FlaskConical, Truck, FileText
} from 'lucide-react';
import {
  EQUIPMENT_OPTIONS, FUEL_OPTIONS, LIME_OPTIONS, FERTILIZER_OPTIONS
} from '../../data/constants';
import { format } from 'date-fns';

const TABS = [
  { id: 'soil', label: 'Độ ẩm & pH đất', icon: Droplets },
  { id: 'fossil', label: 'Nhiên liệu hóa thạch', icon: Fuel },
  { id: 'lime', label: 'Vôi & Dolomite', icon: Mountain },
  { id: 'fertilizer', label: 'Phân bón', icon: Sprout },
  { id: 'soc', label: 'Đo lường SOC', icon: FlaskConical },
];

function getMoistureColor(v) {
  if (v < 40) return 'text-red-600 bg-red-50';
  if (v <= 70) return 'text-green-600 bg-green-50';
  if (v > 80) return 'text-orange-600 bg-orange-50';
  return 'text-yellow-600 bg-yellow-50';
}

function getPHColor(v) {
  if (v < 5) return 'text-red-600 bg-red-50';
  if (v < 5.5) return 'text-yellow-600 bg-yellow-50';
  if (v <= 7) return 'text-green-600 bg-green-50';
  return 'text-orange-600 bg-orange-50';
}

export default function DataInput() {
  const [activeTab, setActiveTab] = useState('soil');
  const { user } = useAuth();
  const {
    getFarmerFarm, getFarmSensors, getFarmFossil, getFarmLime, getFarmFertilizer, getFarmSOC,
    addSoilSensor, deleteSoilSensor, addFossilFuel, deleteFossilFuel,
    addLime, deleteLime, addFertilizer, deleteFertilizer, addSOC
  } = useData();

  const farm = getFarmerFarm(user.id);

  // ── SOIL FORM ──
  const [soilForm, setSoilForm] = useState({
    recorded_date: format(new Date(), 'yyyy-MM-dd'),
    moisture_percent: '',
    ph_value: '',
    input_method: 'manual',
  });

  const handleSoilSubmit = (e) => {
    e.preventDefault();
    addSoilSensor({
      farm_id: farm.id,
      ...soilForm,
      moisture_percent: parseFloat(soilForm.moisture_percent),
      ph_value: parseFloat(soilForm.ph_value),
    });
    setSoilForm({ ...soilForm, moisture_percent: '', ph_value: '' });
  };

  // ── FOSSIL FORM ──
  const [fossilForm, setFossilForm] = useState({
    recorded_date: format(new Date(), 'yyyy-MM-dd'),
    fuel_type: 'diesel',
    quantity_liters: '',
    equipment_type: 'pump',
    invoice_ref: '',
  });

  const handleFossilSubmit = (e) => {
    e.preventDefault();
    addFossilFuel({
      farm_id: farm.id,
      ...fossilForm,
      quantity_liters: parseFloat(fossilForm.quantity_liters),
    });
    setFossilForm({ ...fossilForm, quantity_liters: '', invoice_ref: '' });
  };

  // ── LIME FORM ──
  const [limeForm, setLimeForm] = useState({
    recorded_date: format(new Date(), 'yyyy-MM-dd'),
    lime_type: 'calcium_carbonate',
    quantity_kg: '',
    application_area_ha: '',
    invoice_ref: '',
  });

  const handleLimeSubmit = (e) => {
    e.preventDefault();
    addLime({
      farm_id: farm.id,
      ...limeForm,
      quantity_kg: parseFloat(limeForm.quantity_kg),
      application_area_ha: parseFloat(limeForm.application_area_ha),
    });
    setLimeForm({ ...limeForm, quantity_kg: '', application_area_ha: '', invoice_ref: '' });
  };

  // ── FERTILIZER FORM ──
  const [fertForm, setFertForm] = useState({
    recorded_date: format(new Date(), 'yyyy-MM-dd'),
    fertilizer_type: 'organic',
    product_name: '',
    nitrogen_content_percent: '',
    quantity_kg: '',
    application_notes: '',
  });

  const handleFertSubmit = (e) => {
    e.preventDefault();
    addFertilizer({
      farm_id: farm.id,
      ...fertForm,
      nitrogen_content_percent: parseFloat(fertForm.nitrogen_content_percent),
      quantity_kg: parseFloat(fertForm.quantity_kg),
    });
    setFertForm({ ...fertForm, product_name: '', nitrogen_content_percent: '', quantity_kg: '', application_notes: '' });
  };

  // ── SOC FORM ──
  const [socForm, setSocForm] = useState({
    measurement_date: format(new Date(), 'yyyy-MM-dd'),
    season: 'start',
    season_name: 'Vụ Đông Xuân 2025',
    sample_id: '',
    depth_cm: 30,
    soc_value_ton_per_ha: '',
    lab_name: '',
    notes: '',
  });

  const handleSOCSubmit = (e) => {
    e.preventDefault();
    addSOC({
      farm_id: farm.id,
      ...socForm,
      depth_cm: parseFloat(socForm.depth_cm),
      soc_value_ton_per_ha: parseFloat(socForm.soc_value_ton_per_ha),
    });
    setSocForm({ ...socForm, sample_id: '', soc_value_ton_per_ha: '', lab_name: '', notes: '' });
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";
  const btnCls = "w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-200 transition-all text-sm cursor-pointer";

  const recentSoil = getFarmSensors(farm?.id).slice(0, 10);
  const recentFossil = getFarmFossil(farm?.id).slice(0, 10);
  const recentLime = getFarmLime(farm?.id).slice(0, 10);
  const recentFert = getFarmFertilizer(farm?.id).slice(0, 10);

  const equipLabel = (v) => EQUIPMENT_OPTIONS.find(o => o.value === v)?.label || v;
  const fuelLabel = (v) => FUEL_OPTIONS.find(o => o.value === v)?.label || v;
  const limeLabel = (v) => LIME_OPTIONS.find(o => o.value === v)?.label || v;
  const fertLabel = (v) => FERTILIZER_OPTIONS.find(o => o.value === v)?.label || v;

  const socRecords = getFarmSOC(farm?.id);
  const socChange = useMemo(() => {
    const start = socRecords.find(s => s.season === 'start');
    const end = socRecords.find(s => s.season === 'end');
    if (start && end) return (end.soc_value_ton_per_ha - start.soc_value_ton_per_ha).toFixed(2);
    return null;
  }, [socRecords]);

  return (
    <div className="page-enter max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">📥 Nhập dữ liệu</h1>
      <p className="text-sm text-gray-500 mb-6">Nhập số liệu đo lường và hoạt động canh tác hàng ngày</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════ TAB 1: SOIL ══════ */}
      {activeTab === 'soil' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Droplets size={18} className="text-blue-500" />
              Độ ẩm & pH đất
            </h3>
            <form onSubmit={handleSoilSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Ngày đo</label>
                <input type="date" value={soilForm.recorded_date}
                  onChange={e => setSoilForm({...soilForm, recorded_date: e.target.value})}
                  className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Phương pháp</label>
                <div className="flex gap-2">
                  {['manual', 'sensor'].map(m => (
                    <button key={m} type="button"
                      onClick={() => setSoilForm({...soilForm, input_method: m})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        soilForm.input_method === m ? 'bg-green-100 text-green-700 border-2 border-green-400' : 'bg-gray-50 text-gray-500 border-2 border-transparent'
                      }`}>
                      {m === 'manual' ? '✍️ Nhập tay' : '📡 Cảm biến'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Độ ẩm (%)</label>
                <div className="relative">
                  <input type="number" min="0" max="100" step="0.1" required
                    value={soilForm.moisture_percent}
                    onChange={e => setSoilForm({...soilForm, moisture_percent: e.target.value})}
                    placeholder="0 - 100"
                    className={inputCls} />
                  {soilForm.moisture_percent && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded-full ${getMoistureColor(parseFloat(soilForm.moisture_percent))}`}>
                      {parseFloat(soilForm.moisture_percent) < 40 ? 'Khô' : parseFloat(soilForm.moisture_percent) <= 70 ? 'Tối ưu' : 'Quá ẩm'}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className={labelCls}>Giá trị pH</label>
                <div className="relative">
                  <input type="number" min="0" max="14" step="0.01" required
                    value={soilForm.ph_value}
                    onChange={e => setSoilForm({...soilForm, ph_value: e.target.value})}
                    placeholder="0 - 14"
                    className={inputCls} />
                  {soilForm.ph_value && (
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded-full ${getPHColor(parseFloat(soilForm.ph_value))}`}>
                      {parseFloat(soilForm.ph_value) < 5 ? 'Quá chua' : parseFloat(soilForm.ph_value) <= 7 ? 'Tốt' : 'Kiềm'}
                    </span>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className={btnCls}>💾 Lưu dữ liệu</button>
              </div>
            </form>
          </div>
          {/* Recent entries table */}
          <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm overflow-x-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">10 bản ghi gần nhất</h4>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Ngày</th><th className="pb-2 font-medium">Độ ẩm</th>
                <th className="pb-2 font-medium">pH</th><th className="pb-2 font-medium">PP</th><th className="pb-2"></th>
              </tr></thead>
              <tbody>
                {recentSoil.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 table-row-hover">
                    <td className="py-2.5">{s.recorded_date}</td>
                    <td><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getMoistureColor(s.moisture_percent)}`}>{s.moisture_percent}%</span></td>
                    <td><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getPHColor(s.ph_value)}`}>{s.ph_value}</span></td>
                    <td className="text-gray-500 text-xs">{s.input_method === 'sensor' ? '📡' : '✍️'}</td>
                    <td><button onClick={() => deleteSoilSensor(s.id)} className="text-red-400 hover:text-red-600 cursor-pointer"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════ TAB 2: FOSSIL FUEL ══════ */}
      {activeTab === 'fossil' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Fuel size={18} className="text-orange-500" />
              Nhiên liệu hóa thạch
            </h3>
            <form onSubmit={handleFossilSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Ngày sử dụng</label>
                <input type="date" value={fossilForm.recorded_date}
                  onChange={e => setFossilForm({...fossilForm, recorded_date: e.target.value})}
                  className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Thiết bị</label>
                <select value={fossilForm.equipment_type}
                  onChange={e => setFossilForm({...fossilForm, equipment_type: e.target.value})}
                  className={inputCls}>
                  {EQUIPMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Loại nhiên liệu</label>
                <select value={fossilForm.fuel_type}
                  onChange={e => setFossilForm({...fossilForm, fuel_type: e.target.value})}
                  className={inputCls}>
                  {FUEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Số lượng (lít)</label>
                <input type="number" min="0" step="0.1" required
                  value={fossilForm.quantity_liters}
                  onChange={e => setFossilForm({...fossilForm, quantity_liters: e.target.value})}
                  placeholder="Nhập số lít" className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Số hóa đơn (tùy chọn)</label>
                <input type="text" value={fossilForm.invoice_ref}
                  onChange={e => setFossilForm({...fossilForm, invoice_ref: e.target.value})}
                  placeholder="VD: HD-2024-0125" className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className={btnCls}>💾 Lưu dữ liệu</button>
              </div>
            </form>
          </div>
          <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm overflow-x-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">10 bản ghi gần nhất</h4>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Ngày</th><th className="pb-2 font-medium">Thiết bị</th>
                <th className="pb-2 font-medium">Nhiên liệu</th><th className="pb-2 font-medium">Số lít</th>
                <th className="pb-2 font-medium">Hóa đơn</th><th className="pb-2"></th>
              </tr></thead>
              <tbody>
                {recentFossil.map(f => (
                  <tr key={f.id} className="border-b border-gray-50 table-row-hover">
                    <td className="py-2.5">{f.recorded_date}</td>
                    <td>{equipLabel(f.equipment_type)}</td>
                    <td>{fuelLabel(f.fuel_type)}</td>
                    <td className="font-semibold">{f.quantity_liters}L</td>
                    <td className="text-gray-500 text-xs">{f.invoice_ref || '—'}</td>
                    <td><button onClick={() => deleteFossilFuel(f.id)} className="text-red-400 hover:text-red-600 cursor-pointer"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════ TAB 3: LIME ══════ */}
      {activeTab === 'lime' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Mountain size={18} className="text-yellow-600" />
              Vôi & Dolomite
            </h3>
            <form onSubmit={handleLimeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Ngày bón</label>
                <input type="date" value={limeForm.recorded_date}
                  onChange={e => setLimeForm({...limeForm, recorded_date: e.target.value})}
                  className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Loại vôi</label>
                <select value={limeForm.lime_type}
                  onChange={e => setLimeForm({...limeForm, lime_type: e.target.value})}
                  className={inputCls}>
                  {LIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Khối lượng (kg)</label>
                <input type="number" min="0" step="0.1" required
                  value={limeForm.quantity_kg}
                  onChange={e => setLimeForm({...limeForm, quantity_kg: e.target.value})}
                  placeholder="Nhập kg" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Diện tích bón (ha)</label>
                <input type="number" min="0" step="0.1" required
                  value={limeForm.application_area_ha}
                  onChange={e => setLimeForm({...limeForm, application_area_ha: e.target.value})}
                  placeholder="Nhập ha" className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Số hóa đơn (tùy chọn)</label>
                <input type="text" value={limeForm.invoice_ref}
                  onChange={e => setLimeForm({...limeForm, invoice_ref: e.target.value})}
                  placeholder="VD: VL-2024-001" className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className={btnCls}>💾 Lưu dữ liệu</button>
              </div>
            </form>
          </div>
          <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm overflow-x-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">10 bản ghi gần nhất</h4>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Ngày</th><th className="pb-2 font-medium">Loại</th>
                <th className="pb-2 font-medium">Khối lượng</th><th className="pb-2 font-medium">Diện tích</th><th className="pb-2"></th>
              </tr></thead>
              <tbody>
                {recentLime.map(l => (
                  <tr key={l.id} className="border-b border-gray-50 table-row-hover">
                    <td className="py-2.5">{l.recorded_date}</td>
                    <td>{limeLabel(l.lime_type)}</td>
                    <td className="font-semibold">{l.quantity_kg} kg</td>
                    <td>{l.application_area_ha} ha</td>
                    <td><button onClick={() => deleteLime(l.id)} className="text-red-400 hover:text-red-600 cursor-pointer"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════ TAB 4: FERTILIZER ══════ */}
      {activeTab === 'fertilizer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Sprout size={18} className="text-purple-500" />
              Phân bón
            </h3>
            <form onSubmit={handleFertSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Ngày bón</label>
                <input type="date" value={fertForm.recorded_date}
                  onChange={e => setFertForm({...fertForm, recorded_date: e.target.value})}
                  className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Loại phân</label>
                <select value={fertForm.fertilizer_type}
                  onChange={e => setFertForm({...fertForm, fertilizer_type: e.target.value})}
                  className={inputCls}>
                  {FERTILIZER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Tên sản phẩm</label>
                <input type="text" value={fertForm.product_name}
                  onChange={e => setFertForm({...fertForm, product_name: e.target.value})}
                  placeholder="VD: NPK 20-20-15" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Hàm lượng N (%)</label>
                <input type="number" min="0" max="100" step="0.1" required
                  value={fertForm.nitrogen_content_percent}
                  onChange={e => setFertForm({...fertForm, nitrogen_content_percent: e.target.value})}
                  placeholder="% Nitơ" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Khối lượng (kg)</label>
                <input type="number" min="0" step="0.1" required
                  value={fertForm.quantity_kg}
                  onChange={e => setFertForm({...fertForm, quantity_kg: e.target.value})}
                  placeholder="Nhập kg" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Ghi chú</label>
                <input type="text" value={fertForm.application_notes}
                  onChange={e => setFertForm({...fertForm, application_notes: e.target.value})}
                  placeholder="VD: Bón gốc khu A" className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className={btnCls}>💾 Lưu dữ liệu</button>
              </div>
            </form>
          </div>
          <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm overflow-x-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">10 bản ghi gần nhất</h4>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Ngày</th><th className="pb-2 font-medium">Loại</th>
                <th className="pb-2 font-medium">Sản phẩm</th><th className="pb-2 font-medium">N%</th>
                <th className="pb-2 font-medium">Kg</th><th className="pb-2"></th>
              </tr></thead>
              <tbody>
                {recentFert.map(f => (
                  <tr key={f.id} className="border-b border-gray-50 table-row-hover">
                    <td className="py-2.5">{f.recorded_date}</td>
                    <td>{fertLabel(f.fertilizer_type)}</td>
                    <td className="font-medium">{f.product_name}</td>
                    <td>{f.nitrogen_content_percent}%</td>
                    <td className="font-semibold">{f.quantity_kg}</td>
                    <td><button onClick={() => deleteFertilizer(f.id)} className="text-red-400 hover:text-red-600 cursor-pointer"><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════ TAB 5: SOC ══════ */}
      {activeTab === 'soc' && (
        <div className="space-y-6">
          {/* SOC Change computed card */}
          {socChange !== null && (
            <div className={`rounded-2xl p-5 border-2 shadow-sm ${parseFloat(socChange) >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <p className="text-sm font-medium text-gray-600 mb-1">🧪 Thay đổi SOC (Carbon hữu cơ đất)</p>
              <p className={`text-3xl font-bold ${parseFloat(socChange) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {parseFloat(socChange) >= 0 ? '+' : ''}{socChange} tấn C/ha
              </p>
              <p className="text-xs text-gray-500 mt-1">{parseFloat(socChange) >= 0 ? '✅ Carbon được hấp thụ vào đất' : '⚠️ Carbon bị phát thải từ đất'}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FlaskConical size={18} className="text-teal-600" />
              Đo lường SOC (Carbon hữu cơ đất)
            </h3>
            <form onSubmit={handleSOCSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Thời điểm đo</label>
                <div className="flex gap-2">
                  {['start', 'end'].map(s => (
                    <button key={s} type="button"
                      onClick={() => setSocForm({...socForm, season: s})}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        socForm.season === s ? 'bg-teal-100 text-teal-700 border-2 border-teal-400' : 'bg-gray-50 text-gray-500 border-2 border-transparent'
                      }`}>
                      {s === 'start' ? '🟢 Đầu vụ' : '🔴 Cuối vụ'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelCls}>Ngày đo</label>
                <input type="date" value={socForm.measurement_date}
                  onChange={e => setSocForm({...socForm, measurement_date: e.target.value})}
                  className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Tên mùa vụ</label>
                <input type="text" value={socForm.season_name}
                  onChange={e => setSocForm({...socForm, season_name: e.target.value})}
                  placeholder="VD: Vụ Đông Xuân 2025" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Mã mẫu (Sample ID)</label>
                <input type="text" value={socForm.sample_id}
                  onChange={e => setSocForm({...socForm, sample_id: e.target.value})}
                  placeholder="VD: S-01" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Độ sâu lấy mẫu (cm)</label>
                <input type="number" min="0" step="1" value={socForm.depth_cm}
                  onChange={e => setSocForm({...socForm, depth_cm: e.target.value})}
                  className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Giá trị SOC (tấn C/ha)</label>
                <input type="number" min="0" step="0.01" value={socForm.soc_value_ton_per_ha}
                  onChange={e => setSocForm({...socForm, soc_value_ton_per_ha: e.target.value})}
                  placeholder="Kết quả từ phòng thí nghiệm" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Tên phòng thí nghiệm</label>
                <input type="text" value={socForm.lab_name}
                  onChange={e => setSocForm({...socForm, lab_name: e.target.value})}
                  placeholder="VD: Viện KH Nông nghiệp" className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Ghi chú</label>
                <input type="text" value={socForm.notes}
                  onChange={e => setSocForm({...socForm, notes: e.target.value})}
                  placeholder="Mô tả vị trí lấy mẫu..." className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className={btnCls}>💾 Lưu dữ liệu SOC</button>
              </div>
            </form>
          </div>

          {/* SOC records table */}
          <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm overflow-x-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Lịch sử đo SOC</h4>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="pb-2 font-medium">Thời điểm</th><th className="pb-2 font-medium">Mùa vụ</th>
                <th className="pb-2 font-medium">Mẫu</th><th className="pb-2 font-medium">Độ sâu</th>
                <th className="pb-2 font-medium">SOC (tấn C/ha)</th><th className="pb-2 font-medium">PTN</th>
              </tr></thead>
              <tbody>
                {socRecords.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 table-row-hover">
                    <td className="py-2.5">{s.season === 'start' ? '🟢 Đầu vụ' : '🔴 Cuối vụ'} — {s.measurement_date}</td>
                    <td>{s.season_name}</td>
                    <td>{s.sample_id}</td>
                    <td>{s.depth_cm} cm</td>
                    <td className="font-bold text-teal-700">{s.soc_value_ton_per_ha}</td>
                    <td className="text-xs text-gray-500">{s.lab_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
