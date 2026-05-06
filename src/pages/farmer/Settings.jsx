import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Settings as SettingsIcon, MapPin, TreePalm, Calendar, Ruler, Save } from 'lucide-react';

export default function FarmSettings() {
  const { user } = useAuth();
  const { getFarmerFarm, addToast } = useData();
  const farm = getFarmerFarm(user.id);

  const [form, setForm] = useState({
    name: farm?.name || '',
    location: farm?.location || '',
    area_hectares: farm?.area_hectares || '',
    coconut_variety: farm?.coconut_variety || '',
    planting_year: farm?.planting_year || '',
    tree_count: farm?.tree_count || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addToast('Đã cập nhật thông tin vườn thành công');
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-sm";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="page-enter max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
        <SettingsIcon size={24} className="text-green-600" /> Cài đặt vườn
      </h1>
      <p className="text-sm text-gray-500 mb-6">Quản lý thông tin vườn dừa của bạn</p>

      <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Farm name */}
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1.5"><TreePalm size={14} className="text-green-600" /> Tên vườn</span>
            </label>
            <input type="text" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className={inputCls} required />
          </div>

          {/* Location */}
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-red-500" /> Địa chỉ</span>
            </label>
            <input type="text" value={form.location}
              onChange={e => setForm({...form, location: e.target.value})}
              className={inputCls} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Area */}
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1.5"><Ruler size={14} className="text-blue-500" /> Diện tích (ha)</span>
              </label>
              <input type="number" min="0" step="0.1" value={form.area_hectares}
                onChange={e => setForm({...form, area_hectares: e.target.value})}
                className={inputCls} required />
            </div>

            {/* Tree count */}
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1.5"><TreePalm size={14} className="text-green-500" /> Số cây dừa</span>
              </label>
              <input type="number" min="0" value={form.tree_count}
                onChange={e => setForm({...form, tree_count: e.target.value})}
                className={inputCls} />
            </div>

            {/* Variety */}
            <div>
              <label className={labelCls}>Giống dừa</label>
              <input type="text" value={form.coconut_variety}
                onChange={e => setForm({...form, coconut_variety: e.target.value})}
                placeholder="VD: Dừa xiêm xanh" className={inputCls} />
            </div>

            {/* Planting year */}
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1.5"><Calendar size={14} className="text-amber-500" /> Năm trồng</span>
              </label>
              <input type="number" min="1950" max="2030" value={form.planting_year}
                onChange={e => setForm({...form, planting_year: e.target.value})}
                className={inputCls} />
            </div>
          </div>

          <button type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold text-sm shadow-lg shadow-green-200 hover:shadow-xl transition-all cursor-pointer">
            <Save size={16} /> Lưu thay đổi
          </button>
        </form>
      </div>

      {/* Farm info card */}
      <div className="mt-6 bg-white rounded-2xl border border-green-100 p-5 shadow-sm card-accent">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">📋 Thông tin dự án</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Tiêu chuẩn</p>
            <p className="font-semibold text-green-800">Verra VCS VM0042</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Phương pháp luận</p>
            <p className="font-semibold text-green-800">SOC trong nông nghiệp</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Vùng dự án</p>
            <p className="font-semibold text-green-800">ĐBSCL, Việt Nam</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-gray-500">Cây trồng</p>
            <p className="font-semibold text-green-800">Cocos nucifera</p>
          </div>
        </div>
      </div>
    </div>
  );
}
