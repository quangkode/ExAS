import { useState } from 'react';
import { useAuth, useData } from '@/context/AppContext';
import Modal from '@/components/ui/Modal';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/constants';
import type { Profile, UserRole } from '@/types';
import { Users as UsersIcon, Plus, Edit, ToggleLeft, ToggleRight, KeyRound } from 'lucide-react';

export default function UsersPage() {
  const { user } = useAuth();
  const { profiles, farms, addProfile, updateProfile, showToast, addAuditEntry } = useData();
  if (!user) return null;

  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<Profile | null>(null);

  // Add user form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('supervisor');
  const [phone, setPhone] = useState('');
  const [assignedFarms, setAssignedFarms] = useState<string[]>([]);

  const resetForm = () => { setName(''); setEmail(''); setPassword(''); setRole('supervisor'); setPhone(''); setAssignedFarms([]); };

  const handleAdd = () => {
    if (!name || !email) return;
    const newProfile: Profile = {
      id: `user-${Date.now()}`, email, password: password || 'demo1234',
      full_name: name, role, phone, assigned_farm_ids: assignedFarms,
      is_active: true, created_at: new Date().toISOString(),
    };
    addProfile(newProfile);
    addAuditEntry({ user_id: user.id, user_name: user.full_name, action: 'Thêm người dùng', target_type: 'profile', target_id: newProfile.id, details: `Thêm ${ROLE_LABELS[role]}: ${name}` });
    showToast('success', `Đã thêm ${name}`);
    setShowAdd(false);
    resetForm();
  };

  const toggleActive = (p: Profile) => {
    updateProfile(p.id, { is_active: !p.is_active });
    addAuditEntry({ user_id: user.id, user_name: user.full_name, action: p.is_active ? 'Vô hiệu hóa' : 'Kích hoạt', target_type: 'profile', target_id: p.id, details: `${p.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'} ${p.full_name}` });
    showToast('success', p.is_active ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt tài khoản');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><UsersIcon className="w-6 h-6 text-green-600" /><h2 className="text-2xl font-bold text-gray-800">Quản lí người dùng</h2></div>
        <button onClick={() => { resetForm(); setShowAdd(true); }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700"><Plus className="w-4 h-4" />Thêm người dùng</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Họ tên</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Vai trò</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Vườn phân công</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Trạng thái</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Ngày tạo</th>
            <th className="text-left py-3 px-4 text-gray-500 font-medium">Hành động</th>
          </tr></thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="py-3 px-4 font-medium">{p.full_name}</td>
                <td className="py-3 px-4 text-gray-600">{p.email}</td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[p.role]}`}>{ROLE_LABELS[p.role]}</span></td>
                <td className="py-3 px-4 text-gray-600 text-xs">{p.assigned_farm_ids.map(id => farms.find(f => f.id === id)?.name).filter(Boolean).join(', ') || '—'}</td>
                <td className="py-3 px-4">{p.is_active ? <span className="text-green-600 text-xs font-medium">✅ Hoạt động</span> : <span className="text-red-600 text-xs font-medium">❌ Vô hiệu</span>}</td>
                <td className="py-3 px-4 text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString('vi-VN')}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditUser(p); setName(p.full_name); setRole(p.role); setPhone(p.phone); setAssignedFarms(p.assigned_farm_ids); }} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Chỉnh sửa"><Edit className="w-4 h-4 text-gray-400" /></button>
                    <button onClick={() => toggleActive(p)} className="p-1.5 hover:bg-gray-100 rounded-lg" title={p.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}>{p.is_active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}</button>
                    <button onClick={() => { showToast('success', `Đã gửi email đặt lại mật khẩu đến ${p.email}`); addAuditEntry({ user_id: user.id, user_name: user.full_name, action: 'Đặt lại mật khẩu', target_type: 'profile', target_id: p.id, details: `Gửi email đặt lại MK đến ${p.email}` }); }} className="p-1.5 hover:bg-gray-100 rounded-lg" title="Đặt lại mật khẩu"><KeyRound className="w-4 h-4 text-amber-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Thêm người dùng mới">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu tạm</label><input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="demo1234" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label><select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"><option value="farmer">Nông hộ</option><option value="supervisor">Giám sát viên</option><option value="manager">Cấp quản lí</option></select></div>
          {(role === 'supervisor') && <div><label className="block text-sm font-medium text-gray-700 mb-1">Vườn phân công</label>{farms.map(f => (<label key={f.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={assignedFarms.includes(f.id)} onChange={e => setAssignedFarms(e.target.checked ? [...assignedFarms, f.id] : assignedFarms.filter(id => id !== f.id))} className="rounded" />{f.name}</label>))}</div>}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
          <button onClick={handleAdd} disabled={!name || !email} className="w-full py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50">Thêm người dùng</button>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Chỉnh sửa người dùng">
        {editUser && (
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label><select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"><option value="farmer">Nông hộ</option><option value="supervisor">Giám sát viên</option><option value="manager">Cấp quản lí</option></select></div>
            {(role === 'supervisor') && <div><label className="block text-sm font-medium text-gray-700 mb-1">Vườn phân công</label>{farms.map(f => (<label key={f.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={assignedFarms.includes(f.id)} onChange={e => setAssignedFarms(e.target.checked ? [...assignedFarms, f.id] : assignedFarms.filter(id => id !== f.id))} className="rounded" />{f.name}</label>))}</div>}
            <button onClick={() => { updateProfile(editUser.id, { full_name: name, role, phone, assigned_farm_ids: assignedFarms }); showToast('success', 'Đã cập nhật'); setEditUser(null); }} className="w-full py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700">Cập nhật</button>
          </div>
        )}
      </Modal>
    </div>
  );
}
