import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';
import { NAV_ITEMS, ROLE_LABELS } from '@/lib/constants';
import {
  LayoutDashboard, FilePlus, ClipboardList, BarChart3, CheckSquare,
  FileText, Users, Search, LogOut, TreePalm,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, FilePlus, ClipboardList, BarChart3, CheckSquare,
  FileText, Users, Search,
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const roleBadgeColor = {
    farmer: 'bg-green-600/30 text-green-300',
    supervisor: 'bg-blue-600/30 text-blue-300',
    manager: 'bg-purple-600/30 text-purple-300',
  }[user.role];

  return (
    <aside className="sidebar fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40"
      style={{ background: 'linear-gradient(180deg, #052e16 0%, #0a3d1e 100%)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-green-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600/30 rounded-xl flex items-center justify-center">
            <TreePalm className="w-5 h-5 text-green-300" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">CocoCarbon</h1>
            <p className="text-[10px] text-green-400/70 tracking-widest uppercase">MRV System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          return (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-green-600 text-white shadow-lg shadow-green-900/50 font-medium'
                    : 'text-green-200/70 hover:text-white hover:bg-green-800/40'
                }`
              }>
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-green-800/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-green-700/50 rounded-full flex items-center justify-center text-green-300 font-semibold text-sm">
            {user.full_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{user.full_name}</p>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${roleBadgeColor}`}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-green-300/70 hover:text-white hover:bg-red-600/20 transition-colors">
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
