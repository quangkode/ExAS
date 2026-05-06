import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import FarmerDashboard from './pages/farmer/Dashboard';
import DataInput from './pages/farmer/DataInput';
import MeasurementHistory from './pages/farmer/History';
import CarbonReports from './pages/farmer/Reports';
import FarmSettings from './pages/farmer/Settings';
import VerifierDashboard from './pages/verifier/Dashboard';
import VerifierReports from './pages/verifier/Reports';
import FarmDetail from './pages/verifier/FarmDetail';

function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'verifier' ? '/verifier/dashboard' : '/farmer/dashboard'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated
          ? <Navigate to={user.role === 'verifier' ? '/verifier/dashboard' : '/farmer/dashboard'} replace />
          : <Login />
      } />

      {/* Farmer routes */}
      <Route path="/farmer" element={
        <ProtectedRoute allowedRole="farmer"><Layout /></ProtectedRoute>
      }>
        <Route path="dashboard" element={<FarmerDashboard />} />
        <Route path="input" element={<DataInput />} />
        <Route path="history" element={<MeasurementHistory />} />
        <Route path="reports" element={<CarbonReports />} />
        <Route path="settings" element={<FarmSettings />} />
      </Route>

      {/* Verifier routes */}
      <Route path="/verifier" element={
        <ProtectedRoute allowedRole="verifier"><Layout /></ProtectedRoute>
      }>
        <Route path="dashboard" element={<VerifierDashboard />} />
        <Route path="reports" element={<VerifierReports />} />
        <Route path="farm/:id" element={<FarmDetail />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
