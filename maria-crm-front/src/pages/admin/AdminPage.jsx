// این صفحه Placeholder بخش مدیریت کاربران است.

import { Settings } from 'lucide-react';

/**
 * وظیفه کامپوننت: نمایش وضعیت «در حال توسعه» برای بخش ادمین.
 * ورودی‌ها: ندارد.
 * رفتار: بدون منطق اضافی فقط نمای ثابت رندر می‌کند.
 */
export default function AdminPage() {
  return (
    <div className="bg-white p-12 rounded-xl text-center border border-gray-200 shadow-sm">
      <Settings size={48} className="mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-bold text-gray-600">تنظیمات در حال توسعه</h3>
    </div>
  );
}
