import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileInput, History, FileText, Settings,
  LogOut, Leaf, TreePalm, Shield, ClipboardList, FileCheck
} from 'lucide-react';

const farmerLinks = [
  { to: '/farmer/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/farmer/input', icon: FileInput, label: 'Nhập dữ liệu' },
  { to: '/farmer/history', icon: History, label: 'Lịch sử đo lường' },
  { to: '/farmer/reports', icon: FileText, label: 'Báo cáo carbon' },
  { to: '/farmer/settings', icon: Settings, label: 'Cài đặt vườn' },
];

const verifierLinks = [
  { to: '/verifier/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/verifier/reports', icon: ClipboardList, label: 'Báo cáo kiểm định' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'verifier' ? verifierLinks : farmerLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-green-100 flex flex-col z-40 shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-green-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center shadow-md">
            <TreePalm size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-green-800 leading-tight">CocoCarbon</h1>
            <p className="text-[10px] font-semibold text-teal-600 tracking-widest uppercase">MRV System</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-5 pt-4 pb-2">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
          user?.role === 'verifier'
            ? 'bg-blue-50 text-blue-700'
            : 'bg-green-50 text-green-700'
        }`}>
          {user?.role === 'verifier' ? <Shield size={13} /> : <Leaf size={13} />}
          {user?.role === 'verifier' ? 'Kiểm định viên' : 'Nông hộ'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                  isActive
                    ? 'active bg-green-50 text-green-700 font-semibold'
                    : 'text-gray-600 hover:text-green-700'
                }`
              }
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t border-green-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
