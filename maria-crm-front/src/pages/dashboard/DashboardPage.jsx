// این صفحه خلاصه وضعیت CRM را با KPIها و لیست مشتریان اخیر نمایش می‌دهد.

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';

/**
 * وظیفه کامپوننت: نمایش نمای پیشخوان.
 * ورودی‌ها: ندارد.
 * رفتار: داده‌ها را از API خوانده و به شکل کارت/جدول نمایش می‌دهد.
 */
export default function DashboardPage() {
  const kpiQuery = useQuery({
    queryKey: ['report-kpi'],
    queryFn: () => apiClient.get('/reports/kpi'),
  });

  const contactsQuery = useQuery({
    queryKey: ['contacts', 'recent'],
    queryFn: () => apiClient.get('/contacts'),
  });

  const kpiData = [
    { title: 'کل مشتریان', value: kpiQuery.data?.total_contacts ?? 0 },
    { title: 'فرصت‌های باز', value: kpiQuery.data?.open_deals ?? 0 },
    { title: 'کل پروژه‌ها', value: kpiQuery.data?.total_projects ?? 0 },
    { title: 'فعالیت‌های انجام‌شده', value: kpiQuery.data?.completed_activities ?? 0 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => (
          <div key={kpi.title} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">{kpi.title}</h3>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'sans-serif' }}>
                {kpiQuery.isLoading ? '...' : kpi.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-800">مشتریان اخیر</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs uppercase border-b border-gray-100">
                <th className="px-5 py-3 font-bold">مشتری</th>
                <th className="px-5 py-3 font-bold">بودجه</th>
                <th className="px-5 py-3 font-bold">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {(contactsQuery.data?.items || []).slice(0, 5).map((client) => (
                <tr key={client.id}>
                  <td className="px-5 py-3 font-bold">{client.name}</td>
                  <td className="px-5 py-3 text-[#006039] font-bold" dir="ltr">
                    {client.budget || '-'}
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">{client.status || '-'}</span>
                  </td>
                </tr>
              ))}
              {contactsQuery.isLoading ? (
                <tr>
                  <td className="px-5 py-6 text-sm text-gray-500" colSpan={3}>
                    در حال دریافت داده‌ها...
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
