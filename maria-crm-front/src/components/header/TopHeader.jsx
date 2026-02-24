// این کامپوننت هدر بالای صفحه را نمایش می‌دهد و اکشن‌های عمومی را نگه می‌دارد.

import { Plus, Search } from 'lucide-react';

/**
 * وظیفه کامپوننت: نمایش جست‌وجوی سراسری و دکمه ثبت سرنخ.
 * ورودی‌ها: onOpenLeadModal.
 * رفتار: با کلیک روی دکمه، مودال افزودن سرنخ باز می‌شود.
 */
export default function TopHeader({ onOpenLeadModal }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
      <div className="flex items-center bg-gray-100/80 rounded-lg px-3 py-1.5 focus-within:border-[#006039] focus-within:bg-white transition-all w-80 border border-transparent">
        <Search size={16} className="text-gray-400" />
        <input
          type="text"
          placeholder="جستجوی همه‌جانبه..."
          className="bg-transparent border-none outline-none mr-2 w-full text-sm focus:ring-0"
        />
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden lg:block text-right">
          <p className="text-sm font-bold text-gray-800">براتی</p>
          <p className="text-[10px] text-gray-500">مدیر سیستم (Admin)</p>
        </div>

        <button
          onClick={onOpenLeadModal}
          className="bg-[#006039] hover:bg-[#004d2e] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus size={16} /> ثبت سرنخ جدید
        </button>
      </div>
    </header>
  );
}
