// ═══════════════════════════════════════
// CocoCarbon MRV — Type Definitions
// ═══════════════════════════════════════

export type UserRole = 'farmer' | 'supervisor' | 'manager';

export type ActivityType =
  | 'soil_moisture'
  | 'soil_ph'
  | 'fossil_fuel'
  | 'lime_application'
  | 'fertilizer'
  | 'soc_measurement';

export type LogStatus = 'pending' | 'approved' | 'rejected';
export type ReportStatus = 'draft' | 'submitted' | 'verified' | 'rejected';
export type FuelType = 'gasoline' | 'diesel';
export type LimeType = 'cao3' | 'dolomite';
export type FertilizerType = 'organic' | 'inorganic';
export type SeasonPhase = 'start' | 'end';

export interface Profile {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
  phone: string;
  assigned_farm_ids: string[];
  is_active: boolean;
  created_at: string;
}

export interface Farm {
  id: string;
  name: string;
  farmer_id: string;
  location: string;
  province: string;
  area_hectares: number;
  coconut_variety: string;
  tree_count: number;
  planting_year: number;
  created_at: string;
}

export interface FarmingLog {
  id: string;
  farm_id: string;
  supervisor_id: string;
  log_date: string;
  activity_type: ActivityType;
  quantity: number;
  unit: string;
  notes: string;
  status: LogStatus;
  reviewed_by: string | null;
  review_note: string;
  reviewed_at: string | null;
  created_at: string;
}

export interface LogEvidence {
  id: string;
  log_id: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}

export interface LogDetailFuel {
  log_id: string;
  fuel_type: FuelType;
  equipment: string;
  invoice_ref: string;
}

export interface LogDetailLime {
  log_id: string;
  lime_type: LimeType;
  application_area_ha: number;
  invoice_ref: string;
}

export interface LogDetailFertilizer {
  log_id: string;
  fertilizer_name: string;
  fertilizer_type: FertilizerType;
  nitrogen_percent: number;
}

export interface LogDetailSOC {
  log_id: string;
  season_phase: SeasonPhase;
  season_label: string;
  sample_id: string;
  depth_cm: number;
  lab_name: string;
}

export interface CarbonReport {
  id: string;
  farm_id: string;
  season_start: string;
  season_end: string;
  soc_change_tonC: number;
  fossil_co2_ton: number;
  lime_co2_ton: number;
  n2o_ton: number;
  net_carbon_ton: number;
  status: ReportStatus;
  created_by: string;
  verifier_notes: string;
  created_at: string;
}

export interface AuditEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
