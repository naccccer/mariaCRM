// این صفحه برای مسیرهای نامعتبر استفاده می‌شود.

import { Link } from 'react-router-dom';

/**
 * وظیفه کامپوننت: هندل کردن مسیرهای تعریف‌نشده.
 * ورودی‌ها: ندارد.
 * رفتار: کاربر را به پیشخوان هدایت می‌کند.
 */
export default function NotFoundPage() {
  return (
    <div className="bg-white p-12 rounded-xl text-center border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-700">صفحه مورد نظر پیدا نشد</h3>
      <p className="text-sm text-gray-500 mt-2">مسیر وارد شده معتبر نیست.</p>
      <Link to="/dashboard" className="inline-block mt-5 bg-[#006039] text-white px-5 py-2 rounded-lg text-sm font-bold">
        بازگشت به پیشخوان
      </Link>
    </div>
  );
}
