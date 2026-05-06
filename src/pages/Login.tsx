import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AppContext';
import { TreePalm, Mail, Lock, Eye, EyeOff, Leaf, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const success = login(email, password);
    if (success) {
      const savedUser = JSON.parse(localStorage.getItem('cococarbon_user') || '{}');
      if (savedUser.role === 'farmer') {
        navigate('/farmer/dashboard', { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    } else {
      setError('Email hoặc mật khẩu không đúng');
      setLoading(false);
    }
  };

  const fillDemo = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #0d9488 100%)' }}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-green-300/5 rounded-full blur-2xl" />
        {[...Array(6)].map((_, i) => (
          <Leaf key={i} className="absolute text-green-400/10" style={{
            top: `${15 + i * 15}%`, left: `${5 + i * 16}%`,
            width: 32 + i * 8, height: 32 + i * 8,
            transform: `rotate(${i * 45}deg)`,
          }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-4 animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
            <TreePalm className="w-10 h-10 text-green-300" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CocoCarbon</h1>
          <p className="text-green-200/80 mt-1 text-sm">Hệ thống MRV tín chỉ Carbon vườn dừa</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Đăng nhập</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50/50 text-sm"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50/50 text-sm"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm shadow-lg shadow-green-600/25">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn className="w-4 h-4" /> Đăng nhập</>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Tài khoản demo</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => fillDemo('farmer@coconut.vn', 'demo1234')}
                className="py-2 px-2 rounded-lg text-xs border border-green-200 text-green-700 hover:bg-green-50 transition-colors font-medium">
                🌱 Nông hộ
              </button>
              <button onClick={() => fillDemo('supervisor@coconut.vn', 'demo1234')}
                className="py-2 px-2 rounded-lg text-xs border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors font-medium">
                👷 Giám sát
              </button>
              <button onClick={() => fillDemo('manager@coconut.vn', 'demo1234')}
                className="py-2 px-2 rounded-lg text-xs border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors font-medium">
                👔 Quản lí
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-green-200/50 text-xs mt-6">© 2025 CocoCarbon MRV • Powered by ExAS</p>
      </div>
    </div>
  );
}
