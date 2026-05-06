import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TreePalm, Mail, Lock, Eye, EyeOff, Leaf, Shield, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));

    const result = login(email, password, role);
    setLoading(false);

    if (result.success) {
      navigate(role === 'verifier' ? '/verifier/dashboard' : '/farmer/dashboard');
    } else {
      setError(result.error);
    }
  };

  const fillDemo = (type) => {
    if (type === 'farmer') {
      setEmail('farmer@coconut.vn');
      setPassword('password123');
      setRole('farmer');
    } else {
      setEmail('verifier@verra.vn');
      setPassword('password123');
      setRole('verifier');
    }
  };

  return (
    <div className="min-h-screen login-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-400/5 rounded-full blur-3xl" />
        {/* Floating leaves */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute text-green-400/20"
            style={{
              top: `${15 + i * 15}%`,
              left: `${5 + i * 18}%`,
              transform: `rotate(${i * 60}deg)`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
            }}
          >
            <Leaf size={24 + i * 8} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float {
          from { transform: translateY(0px) rotate(0deg); }
          to { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-4 shadow-2xl">
            <TreePalm size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">CocoCarbon MRV</h1>
          <p className="text-green-100/80 text-sm">Hệ thống tín chỉ Carbon vườn dừa</p>
        </div>

        {/* Login form card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          {/* Role tabs */}
          <div className="flex bg-green-50 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                role === 'farmer'
                  ? 'bg-white text-green-700 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Leaf size={16} />
              Nông hộ
            </button>
            <button
              type="button"
              onClick={() => setRole('verifier')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                role === 'verifier'
                  ? 'bg-white text-blue-700 shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield size={16} />
              Kiểm định viên
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-all text-sm cursor-pointer ${
                role === 'verifier'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-200'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Demo buttons */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">Tài khoản demo</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo('farmer')}
                className="flex-1 py-2 px-3 rounded-lg border border-green-200 text-green-700 text-xs font-medium hover:bg-green-50 transition-colors cursor-pointer"
              >
                🌱 Nông hộ demo
              </button>
              <button
                type="button"
                onClick={() => fillDemo('verifier')}
                className="flex-1 py-2 px-3 rounded-lg border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-50 transition-colors cursor-pointer"
              >
                🔍 Kiểm định viên demo
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-green-200/60 text-xs mt-6">
          © 2024 CocoCarbon MRV — Dự án tín chỉ carbon cho cây dừa Việt Nam
        </p>
      </div>
    </div>
  );
}
