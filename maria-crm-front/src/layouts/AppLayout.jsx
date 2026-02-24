// این لایه اسکلت اصلی برنامه (Sidebar + Header + Outlet) را نگه می‌دارد.

import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopHeader from '../components/header/TopHeader';
import Sidebar from '../components/navigation/Sidebar';
import AddLeadModal from '../features/leads/AddLeadModal';
import { getRouteMeta } from '../app/routeMeta';

/**
 * وظیفه کامپوننت: فراهم کردن چیدمان واحد برای تمام صفحات داخل سیستم CRM.
 * ورودی‌ها: ندارد.
 * رفتار: مودال سراسری ثبت سرنخ را در سطح layout مدیریت می‌کند.
 */
export default function AppLayout() {
  const location = useLocation();
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const currentMeta = useMemo(() => getRouteMeta(location.pathname), [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f4f6f8] flex text-gray-800 selection:bg-[#006039] selection:text-white">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopHeader onOpenLeadModal={() => setIsLeadModalOpen(true)} />

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {currentMeta.showPageTitle && (
              <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-900">{currentMeta.title}</h1>
              </div>
            )}

            <Outlet />
          </div>
        </div>
      </main>

      <AddLeadModal isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} />
    </div>
  );
}
