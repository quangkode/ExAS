import { ShieldOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-500 mb-6">Bạn không có quyền truy cập trang này.</p>
        <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
          Về trang đăng nhập
        </Link>
      </div>
    </div>
  );
}
