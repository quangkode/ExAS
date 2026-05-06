import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Profile, Toast, FarmingLog, LogEvidence, LogDetailFuel, LogDetailLime, LogDetailFertilizer, LogDetailSOC, CarbonReport, Farm, AuditEntry } from '@/types';
import { SEED_PROFILES, SEED_FARMS, SEED_FARMING_LOGS, SEED_LOG_EVIDENCE, SEED_FUEL_DETAILS, SEED_LIME_DETAILS, SEED_FERT_DETAILS, SEED_SOC_DETAILS, SEED_CARBON_REPORTS, SEED_AUDIT_LOG } from '@/data/seedData';

interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

interface DataState {
  // Data
  profiles: Profile[];
  farms: Farm[];
  farmingLogs: FarmingLog[];
  logEvidence: LogEvidence[];
  fuelDetails: LogDetailFuel[];
  limeDetails: LogDetailLime[];
  fertDetails: LogDetailFertilizer[];
  socDetails: LogDetailSOC[];
  carbonReports: CarbonReport[];
  auditLog: AuditEntry[];
  toasts: Toast[];
  // Actions
  addFarmingLog: (log: FarmingLog, evidence?: LogEvidence[], fuelDetail?: LogDetailFuel, limeDetail?: LogDetailLime, fertDetail?: LogDetailFertilizer, socDetail?: LogDetailSOC) => void;
  updateFarmingLog: (id: string, updates: Partial<FarmingLog>) => void;
  deleteFarmingLog: (id: string) => void;
  reviewLog: (id: string, status: 'approved' | 'rejected', reviewNote: string, reviewerId: string) => void;
  addCarbonReport: (report: CarbonReport) => void;
  updateCarbonReport: (id: string, updates: Partial<CarbonReport>) => void;
  addProfile: (profile: Profile) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'created_at'>) => void;
  addEvidence: (ev: LogEvidence) => void;
  showToast: (type: Toast['type'], message: string) => void;
  dismissToast: (id: string) => void;
}

const AuthContext = createContext<AuthState | null>(null);
const DataContext = createContext<DataState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be within DataProvider');
  return ctx;
}

export function AppProviders({ children }: { children: ReactNode }) {
  // ─── Auth ───
  const [user, setUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('cococarbon_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const login = useCallback((email: string, password: string): boolean => {
    const found = SEED_PROFILES.find(u => u.email === email && u.password === password && u.is_active);
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser as Profile);
      localStorage.setItem('cococarbon_user', JSON.stringify(safeUser));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cococarbon_user');
  }, []);

  // ─── Data ───
  const [profiles, setProfiles] = useState<Profile[]>(SEED_PROFILES);
  const [farms] = useState<Farm[]>(SEED_FARMS);
  const [farmingLogs, setFarmingLogs] = useState<FarmingLog[]>(SEED_FARMING_LOGS);
  const [logEvidence, setLogEvidence] = useState<LogEvidence[]>(SEED_LOG_EVIDENCE);
  const [fuelDetails, setFuelDetails] = useState<LogDetailFuel[]>(SEED_FUEL_DETAILS);
  const [limeDetails, setLimeDetails] = useState<LogDetailLime[]>(SEED_LIME_DETAILS);
  const [fertDetails, setFertDetails] = useState<LogDetailFertilizer[]>(SEED_FERT_DETAILS);
  const [socDetails, setSocDetails] = useState<LogDetailSOC[]>(SEED_SOC_DETAILS);
  const [carbonReports, setCarbonReports] = useState<CarbonReport[]>(SEED_CARBON_REPORTS);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(SEED_AUDIT_LOG);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addAuditEntry = useCallback((entry: Omit<AuditEntry, 'id' | 'created_at'>) => {
    setAuditLog(prev => [{
      ...entry,
      id: `audit-${Date.now()}`,
      created_at: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const addFarmingLog = useCallback((log: FarmingLog, evidence?: LogEvidence[], fuelDetail?: LogDetailFuel, limeDetail?: LogDetailLime, fertDetail?: LogDetailFertilizer, socDetail?: LogDetailSOC) => {
    setFarmingLogs(prev => [log, ...prev]);
    if (evidence?.length) setLogEvidence(prev => [...evidence, ...prev]);
    if (fuelDetail) setFuelDetails(prev => [fuelDetail, ...prev]);
    if (limeDetail) setLimeDetails(prev => [limeDetail, ...prev]);
    if (fertDetail) setFertDetails(prev => [fertDetail, ...prev]);
    if (socDetail) setSocDetails(prev => [socDetail, ...prev]);
  }, []);

  const updateFarmingLog = useCallback((id: string, updates: Partial<FarmingLog>) => {
    setFarmingLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteFarmingLog = useCallback((id: string) => {
    setFarmingLogs(prev => prev.filter(l => l.id !== id));
    setLogEvidence(prev => prev.filter(e => e.log_id !== id));
    setFuelDetails(prev => prev.filter(d => d.log_id !== id));
    setLimeDetails(prev => prev.filter(d => d.log_id !== id));
    setFertDetails(prev => prev.filter(d => d.log_id !== id));
    setSocDetails(prev => prev.filter(d => d.log_id !== id));
  }, []);

  const reviewLog = useCallback((id: string, status: 'approved' | 'rejected', reviewNote: string, reviewerId: string) => {
    setFarmingLogs(prev => prev.map(l => l.id === id ? {
      ...l,
      status,
      reviewed_by: reviewerId,
      review_note: reviewNote,
      reviewed_at: new Date().toISOString(),
    } : l));
  }, []);

  const addCarbonReport = useCallback((report: CarbonReport) => {
    setCarbonReports(prev => [report, ...prev]);
  }, []);

  const updateCarbonReport = useCallback((id: string, updates: Partial<CarbonReport>) => {
    setCarbonReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const addProfile = useCallback((profile: Profile) => {
    setProfiles(prev => [profile, ...prev]);
  }, []);

  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const addEvidence = useCallback((ev: LogEvidence) => {
    setLogEvidence(prev => [ev, ...prev]);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      <DataContext.Provider value={{
        profiles, farms, farmingLogs, logEvidence, fuelDetails, limeDetails,
        fertDetails, socDetails, carbonReports, auditLog, toasts,
        addFarmingLog, updateFarmingLog, deleteFarmingLog, reviewLog,
        addCarbonReport, updateCarbonReport, addProfile, updateProfile,
        addAuditEntry, addEvidence, showToast, dismissToast,
      }}>
        {children}
      </DataContext.Provider>
    </AuthContext.Provider>
  );
}
