// این فایل ورودی اصلی اپ React است و فقط پیکربندی مسیرها را رندر می‌کند.

import AppRoutes from './app/routes';

/**
 * وظیفه کامپوننت: Shell سبک برنامه در سطح بالا.
 * ورودی‌ها: ندارد.
 * رفتار: منطق نمایش صفحات را به router واگذار می‌کند.
 */
export default function App() {
  return <AppRoutes />;
}
