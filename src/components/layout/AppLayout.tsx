import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ToastContainer from '@/components/ui/Toast';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      <Sidebar />
      <main className="ml-64 p-6 animate-fade-in">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
