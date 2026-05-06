import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ToastContainer from './ToastContainer';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      <Sidebar />
      <main className="ml-64 p-6 page-enter">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
