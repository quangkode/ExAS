import { Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';
import { useData } from '@/context/AppContext';
import { TreePalm, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ToastContainer from '@/components/ui/Toast';

export default function FarmerLayout() {
  const { user, logout } = useAuth();
  const { farms } = useData();
  const navigate = useNavigate();
  if (!user) return null;

  const farm = farms.find(f => f.farmer_id === user.id);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-green-100 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center">
              <TreePalm className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-800">CocoCarbon MRV</h1>
              {farm && (
                <p className="text-xs text-gray-500">
                  {farm.name} • {farm.area_hectares} ha • {farm.province}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{user.full_name}</p>
              <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[10px] font-medium">
                Nông hộ
              </span>
            </div>
            <button onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Đăng xuất">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 animate-fade-in">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
