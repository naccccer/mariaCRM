// این کامپوننت یک آیتم ناوبری در سایدبار را با وضعیت فعال/غیرفعال نمایش می‌دهد.

import { NavLink } from 'react-router-dom';

/**
 * وظیفه کامپوننت: نمایش لینک ناوبری با آیکن.
 * ورودی‌ها: icon, label, to.
 * رفتار: با NavLink وضعیت active را از مسیر فعلی دریافت می‌کند.
 */
export default function SidebarItem({ icon, label, to }) {
  const IconComponent = icon;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `w-full flex items-center gap-3 px-5 py-3 transition-colors border-r-4 ${
          isActive
            ? 'bg-[#f0fdf4] text-[#006039] border-[#006039]'
            : 'text-gray-500 hover:bg-gray-50 hover:text-[#006039] border-transparent'
        }`
      }
    >
      <IconComponent size={18} className="text-current" />
      <span className="font-medium text-sm tracking-wide">{label}</span>
    </NavLink>
  );
}
