// Emission factor constants (IPCC / Verra VM0042)
export const EMISSION_FACTORS = {
  FOSSIL: {
    gasoline: 2.31,   // kg CO2 per liter
    diesel: 2.68,     // kg CO2 per liter
  },
  LIME: {
    calcium_carbonate: 0.44,   // kg CO2 per kg CaCO3
    dolomite: 0.477,           // kg CO2 per kg dolomite
  },
  N2O_EMISSION_FACTOR: 0.01,  // 1% of N input becomes N2O-N (IPCC Tier 1)
  N2O_GWP: 298,               // Global Warming Potential of N2O
  C_TO_CO2: 3.67,             // Molecular weight ratio C → CO2
};

// Soil moisture thresholds
export const MOISTURE_THRESHOLDS = {
  DRY: 40,
  OPTIMAL_LOW: 40,
  OPTIMAL_HIGH: 70,
  WET: 80,
};

// pH thresholds
export const PH_THRESHOLDS = {
  ACIDIC: 5,
  LOW_OPTIMAL: 5.5,
  HIGH_OPTIMAL: 7,
};

// Report status options
export const REPORT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

export const REPORT_STATUS_LABELS = {
  draft: 'Bản nháp',
  submitted: 'Đã gửi',
  verified: 'Đã kiểm định',
  rejected: 'Từ chối',
};

export const REPORT_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

// Equipment options
export const EQUIPMENT_OPTIONS = [
  { value: 'tractor', label: 'Máy kéo' },
  { value: 'pump', label: 'Máy bơm' },
  { value: 'generator', label: 'Máy phát điện' },
  { value: 'other', label: 'Khác' },
];

// Fuel type options
export const FUEL_OPTIONS = [
  { value: 'gasoline', label: 'Xăng' },
  { value: 'diesel', label: 'Dầu diesel' },
];

// Lime type options
export const LIME_OPTIONS = [
  { value: 'calcium_carbonate', label: 'Vôi (CaCO₃)' },
  { value: 'dolomite', label: 'Dolomite' },
];

// Fertilizer type options
export const FERTILIZER_OPTIONS = [
  { value: 'organic', label: 'Phân hữu cơ' },
  { value: 'inorganic', label: 'Phân vô cơ' },
];
