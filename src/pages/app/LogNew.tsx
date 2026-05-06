import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useData } from '@/context/AppContext';
import EvidenceUploader from '@/components/evidence/EvidenceUploader';
import { ACTIVITY_LABELS, EQUIPMENT_OPTIONS, SOIL_THRESHOLDS } from '@/lib/constants';
import type { ActivityType, FarmingLog, LogEvidence } from '@/types';
import { FilePlus, ChevronRight, Calendar, MapPin, Upload, Eye } from 'lucide-react';

const ACTIVITY_OPTIONS: { value: ActivityType; label: string; icon: string }[] = [
  { value: 'soil_moisture', label: 'Đo độ ẩm đất', icon: '💧' },
  { value: 'soil_ph', label: 'Đo pH đất', icon: '🧪' },
  { value: 'fossil_fuel', label: 'Nhiên liệu hóa thạch', icon: '⛽' },
  { value: 'lime_application', label: 'Bón vôi / Dolomite', icon: '🪨' },
  { value: 'fertilizer', label: 'Bón phân', icon: '🌿' },
  { value: 'soc_measurement', label: 'Đo SOC (đầu/cuối vụ)', icon: '📊' },
];

export default function LogNew() {
  const { user } = useAuth();
  const { farms, addFarmingLog, addAuditEntry, showToast } = useData();
  const navigate = useNavigate();
  if (!user) return null;

  const assignedFarms = user.role === 'manager' ? farms : farms.filter(f => user.assigned_farm_ids.includes(f.id));

  const [step, setStep] = useState(1);
  const [farmId, setFarmId] = useState(assignedFarms[0]?.id || '');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [activityType, setActivityType] = useState<ActivityType>('soil_moisture');

  // Common
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<Array<{ id: string; file_url: string; file_name: string; size: number; progress: number }>>([]);

  // Soil moisture
  const [inputMethod, setInputMethod] = useState('sensor');
  const [depth, setDepth] = useState('25');

  // Fuel
  const [equipment, setEquipment] = useState('may_keo');
  const [fuelType, setFuelType] = useState<'gasoline' | 'diesel'>('diesel');
  const [invoiceRef, setInvoiceRef] = useState('');

  // Lime
  const [limeType, setLimeType] = useState<'cao3' | 'dolomite'>('cao3');
  const [applicationArea, setApplicationArea] = useState('');
  const [limeInvoice, setLimeInvoice] = useState('');

  // Fertilizer
  const [fertName, setFertName] = useState('');
  const [fertType, setFertType] = useState<'organic' | 'inorganic'>('inorganic');
  const [nitrogenPercent, setNitrogenPercent] = useState('');

  // SOC
  const [seasonPhase, setSeasonPhase] = useState<'start' | 'end'>('start');
  const [seasonLabel, setSeasonLabel] = useState('Vụ 1 - 2025');
  const [sampleId, setSampleId] = useState('');
  const [socDepth, setSocDepth] = useState('30');
  const [labName, setLabName] = useState('');

  const getMoistureColor = (v: number) => {
    if (v < SOIL_THRESHOLDS.moisture.low) return 'text-red-600 bg-red-50';
    if (v > SOIL_THRESHOLDS.moisture.high) return 'text-amber-600 bg-amber-50';
    return 'text-green-600 bg-green-50';
  };

  const getPhColor = (v: number) => {
    if (v < 5) return 'text-red-600 bg-red-50';
    if (v < 5.5) return 'text-amber-600 bg-amber-50';
    if (v <= 7) return 'text-green-600 bg-green-50';
    return 'text-amber-600 bg-amber-50';
  };

  const unitMap: Record<ActivityType, string> = {
    soil_moisture: '%', soil_ph: 'pH', fossil_fuel: 'L',
    lime_application: 'kg', fertilizer: 'kg', soc_measurement: 'tC/ha',
  };

  const handleSubmit = () => {
    const logId = `log-${Date.now()}`;
    const log: FarmingLog = {
      id: logId, farm_id: farmId, supervisor_id: user.id,
      log_date: logDate, activity_type: activityType,
      quantity: parseFloat(quantity), unit: unitMap[activityType],
      notes, status: 'pending', reviewed_by: null, review_note: '', reviewed_at: null,
      created_at: new Date().toISOString(),
    };

    const evidence: LogEvidence[] = files.map((f, i) => ({
      id: `ev-${Date.now()}-${i}`, log_id: logId,
      file_url: f.file_url, file_name: f.file_name,
      uploaded_at: new Date().toISOString(),
    }));

    const fuelDetail = activityType === 'fossil_fuel' ? { log_id: logId, fuel_type: fuelType, equipment: EQUIPMENT_OPTIONS.find(e => e.value === equipment)?.label || equipment, invoice_ref: invoiceRef } : undefined;
    const limeDetail = activityType === 'lime_application' ? { log_id: logId, lime_type: limeType, application_area_ha: parseFloat(applicationArea) || 0, invoice_ref: limeInvoice } : undefined;
    const fertDetail = activityType === 'fertilizer' ? { log_id: logId, fertilizer_name: fertName, fertilizer_type: fertType, nitrogen_percent: parseFloat(nitrogenPercent) || 0 } : undefined;
    const socDetail = activityType === 'soc_measurement' ? { log_id: logId, season_phase: seasonPhase, season_label: seasonLabel, sample_id: sampleId, depth_cm: parseInt(socDepth), lab_name: labName } : undefined;

    addFarmingLog(log, evidence, fuelDetail, limeDetail, fertDetail, socDetail);
    addAuditEntry({ user_id: user.id, user_name: user.full_name, action: 'Tạo nhật kí', target_type: 'farming_log', target_id: logId, details: `${ACTIVITY_LABELS[activityType]} — ${quantity} ${unitMap[activityType]}` });
    showToast('success', 'Đã nộp nhật kí — chờ quản lí duyệt');
    navigate('/app/log/history');
  };

  const today = new Date().toISOString().split('T')[0];
  const selectedFarm = farms.find(f => f.id === farmId);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <FilePlus className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-800">Nhập nhật kí canh tác</h2>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2">
            <button onClick={() => s < step && setStep(s)} className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center transition-colors ${step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</button>
            {s < 4 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: Farm & Date */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-800">Chọn vườn & ngày</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"><MapPin className="w-4 h-4 inline mr-1" />Vườn</label>
            <select value={farmId} onChange={e => setFarmId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
              {assignedFarms.map(f => <option key={f.id} value={f.id}>{f.name} — {f.area_hectares}ha</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"><Calendar className="w-4 h-4 inline mr-1" />Ngày</label>
            <input type="date" value={logDate} max={today} onChange={e => setLogDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại hoạt động</label>
            <div className="grid grid-cols-2 gap-2">
              {ACTIVITY_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setActivityType(opt.value)} className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm text-left transition-all ${activityType === opt.value ? 'border-green-500 bg-green-50 text-green-800 ring-2 ring-green-200' : 'border-gray-200 hover:border-green-300 text-gray-700'}`}>
                  <span className="text-lg">{opt.icon}</span>{opt.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep(2)} className="w-full py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">Tiếp tục</button>
        </div>
      )}

      {/* Step 2: Activity fields */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-800">{ACTIVITY_LABELS[activityType]}</h3>

          {activityType === 'soil_moisture' && (<>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Độ ẩm (%)</label><input type="number" min="0" max="100" step="0.1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="0 - 100" />{quantity && <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium ${getMoistureColor(parseFloat(quantity))}`}>{parseFloat(quantity) < 40 ? '🔴 Khô' : parseFloat(quantity) > 80 ? '🟠 Quá ẩm' : '🟢 Tối ưu'} — {quantity}%</div>}</div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phương pháp đo</label><select value={inputMethod} onChange={e => setInputMethod(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"><option value="sensor">Cảm biến</option><option value="manual">Nhập tay</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Độ sâu (cm)</label><input type="number" value={depth} onChange={e => setDepth(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
          </>)}

          {activityType === 'soil_ph' && (<>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Giá trị pH</label><input type="number" min="0" max="14" step="0.1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" placeholder="0 - 14" />{quantity && <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium ${getPhColor(parseFloat(quantity))}`}>{parseFloat(quantity) < 5 ? '🔴 Đất chua' : parseFloat(quantity) < 5.5 ? '🟡 Hơi chua' : parseFloat(quantity) <= 7 ? '🟢 Tối ưu' : '🟠 Kiềm'} — pH {quantity}</div>}</div>
          </>)}

          {activityType === 'fossil_fuel' && (<>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Thiết bị</label><select value={equipment} onChange={e => setEquipment(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none">{EQUIPMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Loại nhiên liệu</label><div className="flex gap-2">{[{ v: 'diesel' as const, l: 'Dầu diesel' }, { v: 'gasoline' as const, l: 'Xăng' }].map(o => <button key={o.v} onClick={() => setFuelType(o.v)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${fuelType === o.v ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600'}`}>{o.l}</button>)}</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Số lượng (lít)</label><input type="number" min="0" step="0.1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Số hóa đơn</label><input type="text" value={invoiceRef} onChange={e => setInvoiceRef(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
          </>)}

          {activityType === 'lime_application' && (<>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Loại vôi</label><div className="flex gap-2">{[{ v: 'cao3' as const, l: 'Vôi CaCO₃' }, { v: 'dolomite' as const, l: 'Dolomite' }].map(o => <button key={o.v} onClick={() => setLimeType(o.v)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${limeType === o.v ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600'}`}>{o.l}</button>)}</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Số lượng (kg)</label><input type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Diện tích bón (ha)</label><input type="number" min="0" step="0.1" value={applicationArea} onChange={e => setApplicationArea(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Số hóa đơn</label><input type="text" value={limeInvoice} onChange={e => setLimeInvoice(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
          </>)}

          {activityType === 'fertilizer' && (<>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tên phân bón</label><input type="text" value={fertName} onChange={e => setFertName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="VD: NPK 20-20-15" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Loại</label><div className="flex gap-2">{[{ v: 'inorganic' as const, l: 'Vô cơ' }, { v: 'organic' as const, l: 'Hữu cơ' }].map(o => <button key={o.v} onClick={() => setFertType(o.v)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${fertType === o.v ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600'}`}>{o.l}</button>)}</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Hàm lượng N (%)</label><input type="number" min="0" max="100" step="0.1" value={nitrogenPercent} onChange={e => setNitrogenPercent(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Số lượng (kg)</label><input type="number" min="0" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" required /></div>
          </>)}

          {activityType === 'soc_measurement' && (<>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Giai đoạn</label><div className="flex gap-2">{[{ v: 'start' as const, l: 'Đầu vụ' }, { v: 'end' as const, l: 'Cuối vụ' }].map(o => <button key={o.v} onClick={() => setSeasonPhase(o.v)} className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${seasonPhase === o.v ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600'}`}>{o.l}</button>)}</div></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nhãn vụ</label><input type="text" value={seasonLabel} onChange={e => setSeasonLabel(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Mã mẫu</label><input type="text" value={sampleId} onChange={e => setSampleId(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Độ sâu lấy mẫu (cm)</label><input type="number" min="0" value={socDepth} onChange={e => setSocDepth(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" placeholder="30" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Giá trị SOC (tC/ha)</label><input type="number" min="0" step="0.1" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phòng thí nghiệm</label><input type="text" value={labName} onChange={e => setLabName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
          </>)}

          <div><label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none h-20" /></div>

          <div className="flex gap-3"><button onClick={() => setStep(1)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Quay lại</button><button onClick={() => setStep(3)} disabled={!quantity} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50">Tiếp tục</button></div>
        </div>
      )}

      {/* Step 3: Evidence */}
      {step === 3 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Upload className="w-5 h-5" />Bằng chứng</h3>
          <EvidenceUploader files={files} onChange={setFiles} required={['fossil_fuel', 'lime_application', 'fertilizer', 'soc_measurement'].includes(activityType)} />
          <div className="flex gap-3"><button onClick={() => setStep(2)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Quay lại</button><button onClick={() => setStep(4)} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700">Xem trước & nộp</button></div>
        </div>
      )}

      {/* Step 4: Preview & Submit */}
      {step === 4 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4 animate-fade-in">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Eye className="w-5 h-5" />Xem trước</h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Vườn:</span><span className="font-medium">{selectedFarm?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Ngày:</span><span className="font-medium">{logDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Hoạt động:</span><span className="font-medium">{ACTIVITY_LABELS[activityType]}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Số lượng:</span><span className="font-medium">{quantity} {unitMap[activityType]}</span></div>
            {notes && <div className="flex justify-between"><span className="text-gray-500">Ghi chú:</span><span className="font-medium">{notes}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Bằng chứng:</span><span className="font-medium">{files.length} tệp</span></div>
          </div>
          <div className="flex gap-3"><button onClick={() => setStep(3)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Quay lại</button><button onClick={handleSubmit} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700">✅ Nộp nhật kí</button></div>
        </div>
      )}
    </div>
  );
}
