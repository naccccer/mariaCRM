// این کامپوننت منوی اصلی برنامه را در سمت راست نمایش می‌دهد.

import { Building, LayoutDashboard, ListTodo, LogOut, ShieldCheck, Users } from 'lucide-react';
import SidebarItem from './SidebarItem';

/**
 * وظیفه کامپوننت: نمایش ناوبری اصلی و دکمه خروج.
 * ورودی‌ها: ندارد.
 * رفتار: مسیرها را به شکل URL-based نمایش می‌دهد.
 */
export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-l border-gray-200 flex flex-col justify-between hidden md:flex z-20 shadow-sm shrink-0">
      <div>
        <div className="h-16 flex items-center justify-center border-b border-gray-100 bg-[#006039]/5">
          <h1 className="text-xl font-black text-[#006039] tracking-tight" style={{ fontFamily: 'serif' }} dir="ltr">
            Maria<span className="text-[#c9a656]">Tamlik</span>
          </h1>
        </div>

        <nav className="mt-4 space-y-1 px-2">
          <SidebarItem icon={LayoutDashboard} label="پیشخوان" to="/dashboard" />
          <SidebarItem icon={Users} label="مشتریان و سرنخ‌ها" to="/clients" />
          <SidebarItem icon={ListTodo} label="مدیریت فعالیت‌ها" to="/activities" />
          <SidebarItem icon={Building} label="برج‌ها و پروژه‌ها" to="/projects" />
          <SidebarItem icon={ShieldCheck} label="کاربران سیستم" to="/admin" />
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold text-sm">
          <LogOut size={18} className="rotate-180" /> خروج از سیستم
        </button>
      </div>
    </aside>
  );
}
