// ═══════════════════════════════════════
// CocoCarbon MRV — Constants & Labels
// ═══════════════════════════════════════

import type { ActivityType, LogStatus, ReportStatus, UserRole } from '@/types';

// Emission factors (IPCC / Verra VM0042)
export const EMISSION_FACTORS = {
  FUEL: {
    gasoline: 2.31,   // kg CO2 per liter
    diesel: 2.68,     // kg CO2 per liter
  },
  LIME: {
    cao3: 0.44,       // kg CO2 per kg CaO3
    dolomite: 0.477,  // kg CO2 per kg Dolomite
  },
  N2O: {
    emission_factor: 0.01,    // fraction of N applied
    n2o_to_co2e: (44 / 28) * 298, // GWP conversion
  },
  CO2_PER_C: 3.67, // tCO2 per tC
};

// Soil thresholds
export const SOIL_THRESHOLDS = {
  moisture: { low: 40, optimal_high: 70, high: 80 },
  ph: { very_low: 5.0, low: 5.5, optimal_high: 7.0 },
};

// Activity type labels (Vietnamese)
export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  soil_moisture: 'Đo độ ẩm đất',
  soil_ph: 'Đo pH đất',
  fossil_fuel: 'Nhiên liệu hóa thạch',
  lime_application: 'Bón vôi',
  fertilizer: 'Bón phân',
  soc_measurement: 'Đo SOC',
};

export const ACTIVITY_ICONS: Record<ActivityType, string> = {
  soil_moisture: 'Droplets',
  soil_ph: 'FlaskConical',
  fossil_fuel: 'Fuel',
  lime_application: 'Mountain',
  fertilizer: 'Sprout',
  soc_measurement: 'TestTube',
};

export const ACTIVITY_UNITS: Record<ActivityType, string> = {
  soil_moisture: '%',
  soil_ph: 'pH',
  fossil_fuel: 'L',
  lime_application: 'kg',
  fertilizer: 'kg',
  soc_measurement: 'tC/ha',
};

// Status labels
export const LOG_STATUS_LABELS: Record<LogStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  draft: 'Bản nháp',
  submitted: 'Đã nộp',
  verified: 'Đã xác minh',
  rejected: 'Từ chối',
};

// Role labels
export const ROLE_LABELS: Record<UserRole, string> = {
  farmer: 'Nông hộ',
  supervisor: 'Giám sát viên',
  manager: 'Cấp quản lí',
};

// Role badge colors
export const ROLE_COLORS: Record<UserRole, string> = {
  farmer: 'bg-green-100 text-green-800',
  supervisor: 'bg-blue-100 text-blue-800',
  manager: 'bg-purple-100 text-purple-800',
};

// Equipment options
export const EQUIPMENT_OPTIONS = [
  { value: 'may_keo', label: 'Máy kéo' },
  { value: 'may_bom', label: 'Máy bơm' },
  { value: 'may_phat', label: 'Máy phát điện' },
  { value: 'khac', label: 'Khác' },
];

// Nav items with role access
export const NAV_ITEMS = [
  { path: '/app/dashboard', label: 'Tổng quan', icon: 'LayoutDashboard', roles: ['supervisor', 'manager'] as UserRole[] },
  { path: '/app/log/new', label: 'Nhập nhật kí', icon: 'FilePlus', roles: ['supervisor', 'manager'] as UserRole[] },
  { path: '/app/log/history', label: 'Nhật kí đã nộp', icon: 'ClipboardList', roles: ['supervisor', 'manager'] as UserRole[] },
  { path: '/app/farms', label: 'Báo cáo vườn', icon: 'BarChart3', roles: ['supervisor', 'manager'] as UserRole[] },
  { path: '/app/review', label: 'Duyệt nhật kí', icon: 'CheckSquare', roles: ['manager'] as UserRole[] },
  { path: '/app/reports', label: 'Báo cáo carbon', icon: 'FileText', roles: ['manager'] as UserRole[] },
  { path: '/app/users', label: 'Quản lí người dùng', icon: 'Users', roles: ['manager'] as UserRole[] },
  { path: '/app/audit', label: 'Lịch sử hoạt động', icon: 'Search', roles: ['manager'] as UserRole[] },
];
