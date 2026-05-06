import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders, useAuth } from './context/AppContext';
import type { UserRole } from './types';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Pages
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import AppDashboard from './pages/app/Dashboard';
import LogNew from './pages/app/LogNew';
import LogHistory from './pages/app/LogHistory';
import FarmReport from './pages/app/FarmReport';
import Review from './pages/app/Review';
import Reports from './pages/app/Reports';
import UsersPage from './pages/app/Users';
import AuditLog from './pages/app/AuditLog';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({ children, roles }: { children: React.ReactNode; roles: UserRole[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    return '/app/dashboard';
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to={isAuthenticated ? getDefaultRoute() : '/login'} replace />} />

      {/* Login */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />
      } />

      {/* Unauthorized */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Supervisor + Manager shared routes */}
      <Route path="/app" element={
        <RequireAuth><RequireRole roles={['supervisor', 'manager']}><AppLayout /></RequireRole></RequireAuth>
      }>
        <Route path="dashboard" element={<AppDashboard />} />
        <Route path="log/new" element={<LogNew />} />
        <Route path="log/history" element={<LogHistory />} />
        <Route path="farms" element={<FarmReport />} />

        {/* Manager-only routes */}
        <Route path="review" element={<RequireRole roles={['manager']}><Review /></RequireRole>} />
        <Route path="reports" element={<RequireRole roles={['manager']}><Reports /></RequireRole>} />
        <Route path="users" element={<RequireRole roles={['manager']}><UsersPage /></RequireRole>} />
        <Route path="audit" element={<RequireRole roles={['manager']}><AuditLog /></RequireRole>} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={isAuthenticated ? getDefaultRoute() : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
