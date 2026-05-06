import { createContext, useContext, useState, useCallback } from 'react';
import {
  FARMS,
  generateSoilSensorData,
  FOSSIL_FUEL_DATA,
  LIME_DATA,
  FERTILIZER_DATA,
  SOC_DATA,
  CARBON_REPORTS,
  MONTHLY_EMISSIONS,
} from '../data/seedData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [farms] = useState(FARMS);
  const [soilSensors, setSoilSensors] = useState(generateSoilSensorData('farm-001'));
  const [fossilFuel, setFossilFuel] = useState(FOSSIL_FUEL_DATA);
  const [limeData, setLimeData] = useState(LIME_DATA);
  const [fertilizerData, setFertilizerData] = useState(FERTILIZER_DATA);
  const [socData, setSocData] = useState(SOC_DATA);
  const [carbonReports, setCarbonReports] = useState(CARBON_REPORTS);
  const [monthlyEmissions] = useState(MONTHLY_EMISSIONS);

  // Toast state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // ── Soil Sensor CRUD ──
  const addSoilSensor = useCallback((entry) => {
    const newEntry = { ...entry, id: `sensor-${Date.now()}`, created_at: new Date().toISOString() };
    setSoilSensors((prev) => [newEntry, ...prev]);
    addToast('Đã lưu dữ liệu độ ẩm & pH đất');
    return newEntry;
  }, [addToast]);

  const deleteSoilSensor = useCallback((id) => {
    setSoilSensors((prev) => prev.filter((s) => s.id !== id));
    addToast('Đã xóa bản ghi', 'info');
  }, [addToast]);

  // ── Fossil Fuel CRUD ──
  const addFossilFuel = useCallback((entry) => {
    const newEntry = { ...entry, id: `fuel-${Date.now()}`, created_at: new Date().toISOString() };
    setFossilFuel((prev) => [newEntry, ...prev]);
    addToast('Đã lưu dữ liệu nhiên liệu hóa thạch');
    return newEntry;
  }, [addToast]);

  const deleteFossilFuel = useCallback((id) => {
    setFossilFuel((prev) => prev.filter((f) => f.id !== id));
    addToast('Đã xóa bản ghi', 'info');
  }, [addToast]);

  // ── Lime CRUD ──
  const addLime = useCallback((entry) => {
    const newEntry = { ...entry, id: `lime-${Date.now()}`, created_at: new Date().toISOString() };
    setLimeData((prev) => [newEntry, ...prev]);
    addToast('Đã lưu dữ liệu vôi/dolomite');
    return newEntry;
  }, [addToast]);

  const deleteLime = useCallback((id) => {
    setLimeData((prev) => prev.filter((l) => l.id !== id));
    addToast('Đã xóa bản ghi', 'info');
  }, [addToast]);

  // ── Fertilizer CRUD ──
  const addFertilizer = useCallback((entry) => {
    const newEntry = { ...entry, id: `fert-${Date.now()}`, created_at: new Date().toISOString() };
    setFertilizerData((prev) => [newEntry, ...prev]);
    addToast('Đã lưu dữ liệu phân bón');
    return newEntry;
  }, [addToast]);

  const deleteFertilizer = useCallback((id) => {
    setFertilizerData((prev) => prev.filter((f) => f.id !== id));
    addToast('Đã xóa bản ghi', 'info');
  }, [addToast]);

  // ── SOC CRUD ──
  const addSOC = useCallback((entry) => {
    const newEntry = { ...entry, id: `soc-${Date.now()}`, created_at: new Date().toISOString() };
    setSocData((prev) => [newEntry, ...prev]);
    addToast('Đã lưu dữ liệu SOC');
    return newEntry;
  }, [addToast]);

  // ── Carbon Report CRUD ──
  const addCarbonReport = useCallback((report) => {
    const newReport = {
      ...report,
      id: `report-${Date.now()}`,
      status: 'draft',
      verifier_id: null,
      verifier_notes: null,
      verified_at: null,
      created_at: new Date().toISOString(),
    };
    setCarbonReports((prev) => [newReport, ...prev]);
    addToast('Đã tạo báo cáo carbon mới');
    return newReport;
  }, [addToast]);

  const submitReport = useCallback((reportId) => {
    setCarbonReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'submitted' } : r))
    );
    addToast('Đã gửi báo cáo để kiểm định');
  }, [addToast]);

  const verifyReport = useCallback((reportId, verifierId, notes, approved) => {
    setCarbonReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: approved ? 'verified' : 'rejected',
              verifier_id: verifierId,
              verifier_notes: notes,
              verified_at: new Date().toISOString(),
            }
          : r
      )
    );
    addToast(approved ? 'Đã xác minh báo cáo thành công' : 'Đã từ chối báo cáo');
  }, [addToast]);

  // ── Get farm by ID ──
  const getFarm = useCallback((farmId) => farms.find((f) => f.id === farmId), [farms]);

  // ── Get farmer's farm ──
  const getFarmerFarm = useCallback(
    (farmerId) => farms.find((f) => f.farmer_id === farmerId),
    [farms]
  );

  // ── Get sensor data for farm ──
  const getFarmSensors = useCallback(
    (farmId) => soilSensors.filter((s) => s.farm_id === farmId),
    [soilSensors]
  );

  // ── Get latest sensor reading ──
  const getLatestSensor = useCallback(
    (farmId) => {
      const farmSensors = soilSensors
        .filter((s) => s.farm_id === farmId)
        .sort((a, b) => new Date(b.recorded_date) - new Date(a.recorded_date));
      return farmSensors[0] || null;
    },
    [soilSensors]
  );

  // ── Get farm emissions ──
  const getFarmFossil = useCallback(
    (farmId) => fossilFuel.filter((f) => f.farm_id === farmId),
    [fossilFuel]
  );
  const getFarmLime = useCallback(
    (farmId) => limeData.filter((l) => l.farm_id === farmId),
    [limeData]
  );
  const getFarmFertilizer = useCallback(
    (farmId) => fertilizerData.filter((f) => f.farm_id === farmId),
    [fertilizerData]
  );
  const getFarmSOC = useCallback(
    (farmId) => socData.filter((s) => s.farm_id === farmId),
    [socData]
  );
  const getFarmReports = useCallback(
    (farmId) => carbonReports.filter((r) => r.farm_id === farmId),
    [carbonReports]
  );

  const value = {
    farms,
    soilSensors,
    fossilFuel,
    limeData,
    fertilizerData,
    socData,
    carbonReports,
    monthlyEmissions,
    toasts,
    addToast,
    addSoilSensor,
    deleteSoilSensor,
    addFossilFuel,
    deleteFossilFuel,
    addLime,
    deleteLime,
    addFertilizer,
    deleteFertilizer,
    addSOC,
    addCarbonReport,
    submitReport,
    verifyReport,
    getFarm,
    getFarmerFarm,
    getFarmSensors,
    getLatestSensor,
    getFarmFossil,
    getFarmLime,
    getFarmFertilizer,
    getFarmSOC,
    getFarmReports,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
