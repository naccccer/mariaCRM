// این فایل متادیتای مسیرها را برای عنوان صفحه و رفتار نمایی نگه می‌دارد.

import { matchPath } from 'react-router-dom';

export const ROUTE_META = [
  { pattern: '/login', title: 'ورود', showPageTitle: false },
  { pattern: '/dashboard', title: 'پیشخوان', showPageTitle: true },
  { pattern: '/clients', title: 'مشتریان و سرنخ‌ها', showPageTitle: true },
  { pattern: '/clients/:clientId', title: 'پرونده مشتری', showPageTitle: false },
  { pattern: '/activities', title: 'مدیریت فعالیت‌ها', showPageTitle: true },
  { pattern: '/deals', title: 'قیف فرصت‌های فروش', showPageTitle: true },
  { pattern: '/tickets', title: 'تیکت‌های پشتیبانی', showPageTitle: true },
  { pattern: '/projects', title: 'برج‌ها و پروژه‌ها', showPageTitle: true },
  { pattern: '/reports', title: 'گزارش‌های پیشرفته', showPageTitle: true },
  { pattern: '/users', title: 'مدیریت کاربران و نقش‌ها', showPageTitle: true },
  { pattern: '/admin', title: 'کاربران سیستم', showPageTitle: true },
  { pattern: '*', title: 'صفحه نامعتبر', showPageTitle: true },
];

export const DEFAULT_ROUTE_META = {
  title: '',
  showPageTitle: false,
};

/**
 * وظیفه تابع: متادیتای نزدیک‌ترین مسیر منطبق را برمی‌گرداند.
 * ورودی‌ها: pathname.
 * رفتار: الگوها را به ترتیب بررسی می‌کند تا اولین match پیدا شود.
 */
export function getRouteMeta(pathname) {
  for (const route of ROUTE_META) {
    if (route.pattern === '*') {
      continue;
    }

    const isMatched = Boolean(matchPath({ path: route.pattern, end: true }, pathname));
    if (isMatched) {
      return route;
    }
  }

  const fallback = ROUTE_META.find((route) => route.pattern === '*');
  return fallback ?? DEFAULT_ROUTE_META;
}
