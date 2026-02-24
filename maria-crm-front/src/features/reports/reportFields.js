// این فایل ستون‌های قابل خروجی برای گزارش مشتریان را تعریف می‌کند.

/**
 * وظیفه: نگاشت فیلدهای داده مشتری به برچسب قابل نمایش در خروجی.
 */
export const CLIENT_REPORT_FIELDS = [
  {
    id: 'name',
    label: 'نام و نام خانوادگی',
    getValue: (client) => client.name,
  },
  {
    id: 'phone',
    label: 'شماره موبایل',
    getValue: (client) => client.phone,
  },
  {
    id: 'budget',
    label: 'توان مالی',
    getValue: (client) => client.budget,
  },
  {
    id: 'interest',
    label: 'پروژه هدف',
    getValue: (client) => client.interest,
  },
  {
    id: 'status',
    label: 'وضعیت',
    getValue: (client) => client.status,
  },
  {
    id: 'date',
    label: 'تاریخ ثبت',
    getValue: (client) => client.date,
  },
];

export const DEFAULT_CLIENT_REPORT_FIELD_IDS = CLIENT_REPORT_FIELDS.map((field) => field.id);

/**
 * وظیفه: لیست فیلدهای معتبر خروجی را بر اساس شناسه‌ها برمی‌گرداند.
 */
export function resolveClientReportFields(fieldIds) {
  const fieldIdSet = new Set(fieldIds);
  return CLIENT_REPORT_FIELDS.filter((field) => fieldIdSet.has(field.id));
}
