// ═══════════════════════════════════════
// CocoCarbon MRV — Seed Data
// ═══════════════════════════════════════

import type {
  Profile, Farm, FarmingLog, LogEvidence,
  LogDetailFuel, LogDetailLime, LogDetailFertilizer, LogDetailSOC,
  CarbonReport, AuditEntry
} from '@/types';

const today = new Date();
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};
const rand = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

// ─── USERS ───
export const SEED_PROFILES: Profile[] = [
  {
    id: 'farmer-001',
    email: 'farmer@coconut.vn',
    password: 'demo1234',
    full_name: 'Nguyễn Văn Hùng',
    role: 'farmer',
    phone: '0901234567',
    assigned_farm_ids: ['farm-001'],
    is_active: true,
    created_at: '2025-01-15T08:00:00Z',
  },
  {
    id: 'supervisor-001',
    email: 'supervisor@coconut.vn',
    password: 'demo1234',
    full_name: 'Trần Thị Lan',
    role: 'supervisor',
    phone: '0912345678',
    assigned_farm_ids: ['farm-001'],
    is_active: true,
    created_at: '2025-01-20T08:00:00Z',
  },
  {
    id: 'manager-001',
    email: 'manager@coconut.vn',
    password: 'demo1234',
    full_name: 'Lê Minh Quân',
    role: 'manager',
    phone: '0923456789',
    assigned_farm_ids: [],
    is_active: true,
    created_at: '2025-01-10T08:00:00Z',
  },
];

// ─── FARMS ───
export const SEED_FARMS: Farm[] = [
  {
    id: 'farm-001',
    name: 'Vườn Dừa Bến Tre',
    farmer_id: 'farmer-001',
    location: 'Xã Phú An Hòa, Huyện Châu Thành',
    province: 'Bến Tre',
    area_hectares: 5,
    coconut_variety: 'Dừa xiêm xanh',
    tree_count: 500,
    planting_year: 2018,
    created_at: '2025-01-15T08:00:00Z',
  },
];

// ─── FARMING LOGS (30 days of soil data + emissions) ───
const generateId = (prefix: string, i: number) => `${prefix}-${String(i).padStart(3, '0')}`;

export const SEED_FARMING_LOGS: FarmingLog[] = [];
export const SEED_LOG_EVIDENCE: LogEvidence[] = [];
export const SEED_FUEL_DETAILS: LogDetailFuel[] = [];
export const SEED_LIME_DETAILS: LogDetailLime[] = [];
export const SEED_FERT_DETAILS: LogDetailFertilizer[] = [];
export const SEED_SOC_DETAILS: LogDetailSOC[] = [];

// 30 days soil moisture
for (let i = 0; i < 30; i++) {
  const logId = generateId('log-moisture', i);
  const status = i < 25 ? 'approved' as const : 'pending' as const;
  SEED_FARMING_LOGS.push({
    id: logId,
    farm_id: 'farm-001',
    supervisor_id: 'supervisor-001',
    log_date: daysAgo(29 - i),
    activity_type: 'soil_moisture',
    quantity: rand(35, 75),
    unit: '%',
    notes: '',
    status,
    reviewed_by: status === 'approved' ? 'manager-001' : null,
    review_note: '',
    reviewed_at: status === 'approved' ? daysAgo(29 - i) : null,
    created_at: daysAgo(29 - i) + 'T08:00:00Z',
  });
  if (i % 5 === 0) {
    SEED_LOG_EVIDENCE.push({
      id: `ev-moisture-${i}`,
      log_id: logId,
      file_url: `https://picsum.photos/seed/soil${i}/400/300`,
      file_name: `do_am_${daysAgo(29 - i)}.jpg`,
      uploaded_at: daysAgo(29 - i) + 'T08:00:00Z',
    });
  }
}

// 30 days soil pH
for (let i = 0; i < 30; i++) {
  const logId = generateId('log-ph', i);
  const status = i < 25 ? 'approved' as const : 'pending' as const;
  SEED_FARMING_LOGS.push({
    id: logId,
    farm_id: 'farm-001',
    supervisor_id: 'supervisor-001',
    log_date: daysAgo(29 - i),
    activity_type: 'soil_ph',
    quantity: rand(5.0, 7.0),
    unit: 'pH',
    notes: '',
    status,
    reviewed_by: status === 'approved' ? 'manager-001' : null,
    review_note: '',
    reviewed_at: status === 'approved' ? daysAgo(29 - i) : null,
    created_at: daysAgo(29 - i) + 'T08:30:00Z',
  });
}

// 5 fossil fuel entries (all approved)
const fuelEquipment = ['Máy kéo', 'Máy bơm', 'Máy phát điện', 'Máy kéo', 'Máy bơm'];
for (let i = 0; i < 5; i++) {
  const logId = generateId('log-fuel', i);
  const fuelType = i % 2 === 0 ? 'diesel' as const : 'gasoline' as const;
  SEED_FARMING_LOGS.push({
    id: logId,
    farm_id: 'farm-001',
    supervisor_id: 'supervisor-001',
    log_date: daysAgo(25 - i * 5),
    activity_type: 'fossil_fuel',
    quantity: rand(20, 80),
    unit: 'L',
    notes: `Sử dụng ${fuelEquipment[i]}`,
    status: 'approved',
    reviewed_by: 'manager-001',
    review_note: '',
    reviewed_at: daysAgo(24 - i * 5),
    created_at: daysAgo(25 - i * 5) + 'T10:00:00Z',
  });
  SEED_FUEL_DETAILS.push({
    log_id: logId,
    fuel_type: fuelType,
    equipment: fuelEquipment[i],
    invoice_ref: `HD-FUEL-${2025}${String(i + 1).padStart(3, '0')}`,
  });
  SEED_LOG_EVIDENCE.push({
    id: `ev-fuel-${i}`,
    log_id: logId,
    file_url: `https://picsum.photos/seed/fuel${i}/400/300`,
    file_name: `hoa_don_nhien_lieu_${i + 1}.jpg`,
    uploaded_at: daysAgo(25 - i * 5) + 'T10:00:00Z',
  });
}

// 3 lime entries (all approved)
for (let i = 0; i < 3; i++) {
  const logId = generateId('log-lime', i);
  const limeType = i % 2 === 0 ? 'cao3' as const : 'dolomite' as const;
  SEED_FARMING_LOGS.push({
    id: logId,
    farm_id: 'farm-001',
    supervisor_id: 'supervisor-001',
    log_date: daysAgo(20 - i * 7),
    activity_type: 'lime_application',
    quantity: rand(100, 500),
    unit: 'kg',
    notes: `Bón vôi đợt ${i + 1}`,
    status: 'approved',
    reviewed_by: 'manager-001',
    review_note: '',
    reviewed_at: daysAgo(19 - i * 7),
    created_at: daysAgo(20 - i * 7) + 'T09:00:00Z',
  });
  SEED_LIME_DETAILS.push({
    log_id: logId,
    lime_type: limeType,
    application_area_ha: rand(1, 5),
    invoice_ref: `HD-LIME-${2025}${String(i + 1).padStart(3, '0')}`,
  });
  SEED_LOG_EVIDENCE.push({
    id: `ev-lime-${i}`,
    log_id: logId,
    file_url: `https://picsum.photos/seed/lime${i}/400/300`,
    file_name: `hoa_don_voi_${i + 1}.jpg`,
    uploaded_at: daysAgo(20 - i * 7) + 'T09:00:00Z',
  });
}

// 4 fertilizer entries (all approved)
const fertNames = ['NPK 20-20-15', 'Urea', 'Phân hữu cơ vi sinh', 'DAP'];
for (let i = 0; i < 4; i++) {
  const logId = generateId('log-fert', i);
  SEED_FARMING_LOGS.push({
    id: logId,
    farm_id: 'farm-001',
    supervisor_id: 'supervisor-001',
    log_date: daysAgo(18 - i * 4),
    activity_type: 'fertilizer',
    quantity: rand(50, 200),
    unit: 'kg',
    notes: `Bón phân ${fertNames[i]}`,
    status: 'approved',
    reviewed_by: 'manager-001',
    review_note: '',
    reviewed_at: daysAgo(17 - i * 4),
    created_at: daysAgo(18 - i * 4) + 'T11:00:00Z',
  });
  SEED_FERT_DETAILS.push({
    log_id: logId,
    fertilizer_name: fertNames[i],
    fertilizer_type: i === 2 ? 'organic' : 'inorganic',
    nitrogen_percent: [20, 46, 3, 18][i],
  });
  SEED_LOG_EVIDENCE.push({
    id: `ev-fert-${i}`,
    log_id: logId,
    file_url: `https://picsum.photos/seed/fert${i}/400/300`,
    file_name: `nhat_ki_bon_phan_${i + 1}.jpg`,
    uploaded_at: daysAgo(18 - i * 4) + 'T11:00:00Z',
  });
}

// 2 SOC measurements (start + end season)
for (let i = 0; i < 2; i++) {
  const logId = generateId('log-soc', i);
  const phase = i === 0 ? 'start' as const : 'end' as const;
  const socValue = i === 0 ? 45.2 : 48.8;
  SEED_FARMING_LOGS.push({
    id: logId,
    farm_id: 'farm-001',
    supervisor_id: 'supervisor-001',
    log_date: i === 0 ? daysAgo(90) : daysAgo(5),
    activity_type: 'soc_measurement',
    quantity: socValue,
    unit: 'tC/ha',
    notes: `Đo SOC ${phase === 'start' ? 'đầu vụ' : 'cuối vụ'}`,
    status: 'approved',
    reviewed_by: 'manager-001',
    review_note: '',
    reviewed_at: i === 0 ? daysAgo(89) : daysAgo(4),
    created_at: (i === 0 ? daysAgo(90) : daysAgo(5)) + 'T14:00:00Z',
  });
  SEED_SOC_DETAILS.push({
    log_id: logId,
    season_phase: phase,
    season_label: 'Vụ 1 - 2025',
    sample_id: `SOC-${2025}-${String(i + 1).padStart(2, '0')}`,
    depth_cm: 30,
    lab_name: 'Viện Khoa học Nông nghiệp miền Nam',
  });
  SEED_LOG_EVIDENCE.push({
    id: `ev-soc-${i}`,
    log_id: logId,
    file_url: `https://picsum.photos/seed/soc${i}/400/300`,
    file_name: `phieu_ket_qua_soc_${phase}.pdf`,
    uploaded_at: (i === 0 ? daysAgo(90) : daysAgo(5)) + 'T14:00:00Z',
  });
}

// ─── CARBON REPORT ───
export const SEED_CARBON_REPORTS: CarbonReport[] = [
  {
    id: 'report-001',
    farm_id: 'farm-001',
    season_start: daysAgo(90),
    season_end: daysAgo(5),
    soc_change_tonC: 3.6,
    fossil_co2_ton: 0.35,
    lime_co2_ton: 0.22,
    n2o_ton: 0.18,
    net_carbon_ton: 12.46,
    status: 'draft',
    created_by: 'manager-001',
    verifier_notes: '',
    created_at: daysAgo(3) + 'T10:00:00Z',
  },
];

// ─── AUDIT LOG ───
export const SEED_AUDIT_LOG: AuditEntry[] = [
  {
    id: 'audit-001',
    user_id: 'supervisor-001',
    user_name: 'Trần Thị Lan',
    action: 'Tạo nhật kí',
    target_type: 'farming_log',
    target_id: 'log-moisture-000',
    details: 'Nhập đo độ ẩm đất — 52.3%',
    created_at: daysAgo(29) + 'T08:00:00Z',
  },
  {
    id: 'audit-002',
    user_id: 'manager-001',
    user_name: 'Lê Minh Quân',
    action: 'Duyệt nhật kí',
    target_type: 'farming_log',
    target_id: 'log-moisture-000',
    details: 'Đã duyệt nhật kí đo độ ẩm',
    created_at: daysAgo(29) + 'T09:00:00Z',
  },
  {
    id: 'audit-003',
    user_id: 'supervisor-001',
    user_name: 'Trần Thị Lan',
    action: 'Tạo nhật kí',
    target_type: 'farming_log',
    target_id: 'log-fuel-000',
    details: 'Nhập nhiên liệu hóa thạch — 45L diesel',
    created_at: daysAgo(25) + 'T10:00:00Z',
  },
  {
    id: 'audit-004',
    user_id: 'manager-001',
    user_name: 'Lê Minh Quân',
    action: 'Tạo báo cáo carbon',
    target_type: 'carbon_report',
    target_id: 'report-001',
    details: 'Tạo bản nháp báo cáo Vụ 1 - 2025',
    created_at: daysAgo(3) + 'T10:00:00Z',
  },
];
