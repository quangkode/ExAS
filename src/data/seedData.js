import { format, subDays, startOfMonth } from 'date-fns';

// Helper to generate random number in range
const rand = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

// Generate dates for last N days
const daysAgo = (n) => format(subDays(new Date(), n), 'yyyy-MM-dd');

// ═══════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════
export const USERS = [
  {
    id: 'farmer-001',
    email: 'farmer@coconut.vn',
    password: 'password123',
    name: 'Nguyễn Văn Minh',
    role: 'farmer',
    avatar: null,
  },
  {
    id: 'verifier-001',
    email: 'verifier@verra.vn',
    password: 'password123',
    name: 'Trần Thị Lan',
    role: 'verifier',
    avatar: null,
  },
];

// ═══════════════════════════════════════════════════
// FARMS
// ═══════════════════════════════════════════════════
export const FARMS = [
  {
    id: 'farm-001',
    farmer_id: 'farmer-001',
    name: 'Vườn Dừa Bến Tre',
    location: 'Xã Hưng Phong, Huyện Giồng Trôm, Bến Tre',
    area_hectares: 5,
    coconut_variety: 'Dừa Ta (dừa xiêm xanh)',
    planting_year: 2018,
    tree_count: 500,
    created_at: '2024-01-15',
  },
  {
    id: 'farm-002',
    farmer_id: 'farmer-002',
    name: 'Vườn Dừa Trà Vinh',
    location: 'Xã Long Hữu, Huyện Duyên Hải, Trà Vinh',
    area_hectares: 3.2,
    coconut_variety: 'Dừa Sáp',
    planting_year: 2020,
    tree_count: 320,
    created_at: '2024-03-20',
  },
];

// ═══════════════════════════════════════════════════
// SOIL SENSOR DATA (30 days)
// ═══════════════════════════════════════════════════
export const generateSoilSensorData = (farmId = 'farm-001') => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    // Simulate realistic soil moisture (typically 35-75%)
    const baseMoisture = 55 + Math.sin(i / 5) * 15;
    const moisture = Math.max(25, Math.min(90, baseMoisture + rand(-8, 8)));
    
    // Simulate pH (typically 5.5-7 for coconut)
    const basePH = 6.2 + Math.sin(i / 7) * 0.5;
    const ph = Math.max(4.5, Math.min(8, basePH + rand(-0.3, 0.3)));
    
    data.push({
      id: `sensor-${farmId}-${i}`,
      farm_id: farmId,
      recorded_date: daysAgo(i),
      moisture_percent: Math.round(moisture * 10) / 10,
      ph_value: Math.round(ph * 100) / 100,
      input_method: i % 5 === 0 ? 'manual' : 'sensor',
      created_at: daysAgo(i),
    });
  }
  return data;
};

// ═══════════════════════════════════════════════════
// FOSSIL FUEL EMISSIONS
// ═══════════════════════════════════════════════════
export const FOSSIL_FUEL_DATA = [
  {
    id: 'fuel-001',
    farm_id: 'farm-001',
    recorded_date: daysAgo(25),
    fuel_type: 'diesel',
    quantity_liters: 15,
    equipment_type: 'pump',
    invoice_ref: 'HD-2024-0125',
    created_at: daysAgo(25),
  },
  {
    id: 'fuel-002',
    farm_id: 'farm-001',
    recorded_date: daysAgo(18),
    fuel_type: 'gasoline',
    quantity_liters: 8,
    equipment_type: 'generator',
    invoice_ref: 'HD-2024-0132',
    created_at: daysAgo(18),
  },
  {
    id: 'fuel-003',
    farm_id: 'farm-001',
    recorded_date: daysAgo(10),
    fuel_type: 'diesel',
    quantity_liters: 20,
    equipment_type: 'tractor',
    invoice_ref: 'HD-2024-0145',
    created_at: daysAgo(10),
  },
  {
    id: 'fuel-004',
    farm_id: 'farm-001',
    recorded_date: daysAgo(5),
    fuel_type: 'diesel',
    quantity_liters: 12,
    equipment_type: 'pump',
    invoice_ref: 'HD-2024-0158',
    created_at: daysAgo(5),
  },
  {
    id: 'fuel-005',
    farm_id: 'farm-001',
    recorded_date: daysAgo(2),
    fuel_type: 'gasoline',
    quantity_liters: 5,
    equipment_type: 'other',
    invoice_ref: 'HD-2024-0162',
    created_at: daysAgo(2),
  },
];

// ═══════════════════════════════════════════════════
// LIME DATA
// ═══════════════════════════════════════════════════
export const LIME_DATA = [
  {
    id: 'lime-001',
    farm_id: 'farm-001',
    recorded_date: daysAgo(20),
    lime_type: 'calcium_carbonate',
    quantity_kg: 200,
    application_area_ha: 2.5,
    invoice_ref: 'VL-2024-001',
    created_at: daysAgo(20),
  },
  {
    id: 'lime-002',
    farm_id: 'farm-001',
    recorded_date: daysAgo(8),
    lime_type: 'dolomite',
    quantity_kg: 150,
    application_area_ha: 2,
    invoice_ref: 'VL-2024-002',
    created_at: daysAgo(8),
  },
];

// ═══════════════════════════════════════════════════
// FERTILIZER DATA
// ═══════════════════════════════════════════════════
export const FERTILIZER_DATA = [
  {
    id: 'fert-001',
    farm_id: 'farm-001',
    recorded_date: daysAgo(22),
    fertilizer_type: 'organic',
    product_name: 'Phân hữu cơ vi sinh',
    nitrogen_content_percent: 2.5,
    quantity_kg: 500,
    application_notes: 'Bón gốc 1kg/cây, 250 cây khu A',
    created_at: daysAgo(22),
  },
  {
    id: 'fert-002',
    farm_id: 'farm-001',
    recorded_date: daysAgo(15),
    fertilizer_type: 'inorganic',
    product_name: 'NPK 20-20-15',
    nitrogen_content_percent: 20,
    quantity_kg: 100,
    application_notes: 'Bón thúc 200g/cây, khu B',
    created_at: daysAgo(15),
  },
  {
    id: 'fert-003',
    farm_id: 'farm-001',
    recorded_date: daysAgo(3),
    fertilizer_type: 'organic',
    product_name: 'Phân trùn quế',
    nitrogen_content_percent: 1.8,
    quantity_kg: 300,
    application_notes: 'Bón tất cả các cây khu A và B',
    created_at: daysAgo(3),
  },
];

// ═══════════════════════════════════════════════════
// SOC MEASUREMENTS
// ═══════════════════════════════════════════════════
export const SOC_DATA = [
  {
    id: 'soc-001',
    farm_id: 'farm-001',
    measurement_date: '2024-01-20',
    season: 'start',
    season_name: 'Vụ Đông Xuân 2024',
    sample_id: 'S-01',
    depth_cm: 30,
    soc_value_ton_per_ha: 42.5,
    lab_name: 'Viện Khoa học Nông nghiệp Miền Nam',
    notes: 'Mẫu đất lấy tại 5 điểm đại diện',
    created_at: '2024-01-20',
  },
  {
    id: 'soc-002',
    farm_id: 'farm-001',
    measurement_date: '2024-06-15',
    season: 'end',
    season_name: 'Vụ Đông Xuân 2024',
    sample_id: 'S-02',
    depth_cm: 30,
    soc_value_ton_per_ha: 45.8,
    lab_name: 'Viện Khoa học Nông nghiệp Miền Nam',
    notes: 'Mẫu đất cuối vụ, cùng vị trí lấy mẫu đầu vụ',
    created_at: '2024-06-15',
  },
];

// ═══════════════════════════════════════════════════
// CARBON REPORTS
// ═══════════════════════════════════════════════════
export const CARBON_REPORTS = [
  {
    id: 'report-001',
    farm_id: 'farm-001',
    season_start: '2024-01-01',
    season_end: '2024-06-30',
    season_name: 'Vụ Đông Xuân 2024',
    soc_change_ton: 3.3,
    fossil_co2_ton: 0.145,
    lime_co2_ton: 0.160,
    fertilizer_n2o_ton: 0.048,
    net_carbon_ton: 11.756,
    status: 'verified',
    verifier_id: 'verifier-001',
    verifier_notes: 'Số liệu đầy đủ, phương pháp đo SOC đúng quy trình. Đã xác minh hóa đơn nhiên liệu.',
    verified_at: '2024-07-20',
    created_at: '2024-07-01',
  },
  {
    id: 'report-002',
    farm_id: 'farm-001',
    season_start: '2024-07-01',
    season_end: '2024-12-31',
    season_name: 'Vụ Hè Thu 2024',
    soc_change_ton: 2.8,
    fossil_co2_ton: 0.132,
    lime_co2_ton: 0.088,
    fertilizer_n2o_ton: 0.035,
    net_carbon_ton: 10.021,
    status: 'submitted',
    verifier_id: null,
    verifier_notes: null,
    verified_at: null,
    created_at: '2025-01-10',
  },
];

// ═══════════════════════════════════════════════════
// MONTHLY EMISSION AGGREGATES (for bar chart)
// ═══════════════════════════════════════════════════
export const MONTHLY_EMISSIONS = [
  { month: 'T1', fossil: 0.035, lime: 0.088, fertilizer: 0.012 },
  { month: 'T2', fossil: 0.028, lime: 0, fertilizer: 0.008 },
  { month: 'T3', fossil: 0.042, lime: 0.044, fertilizer: 0.015 },
  { month: 'T4', fossil: 0.031, lime: 0, fertilizer: 0.010 },
  { month: 'T5', fossil: 0.038, lime: 0.072, fertilizer: 0.018 },
  { month: 'T6', fossil: 0.045, lime: 0, fertilizer: 0.013 },
];
