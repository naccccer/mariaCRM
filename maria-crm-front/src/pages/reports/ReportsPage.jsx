import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/apiClient';

export default function ReportsPage() {
  const kpiQuery = useQuery({ queryKey: ['report-kpi'], queryFn: () => apiClient.get('/reports/kpi') });
  const pipelineQuery = useQuery({ queryKey: ['report-pipeline'], queryFn: () => apiClient.get('/reports/pipeline') });
  const usersQuery = useQuery({ queryKey: ['report-users'], queryFn: () => apiClient.get('/reports/users') });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="کل مشتریان" value={kpiQuery.data?.total_contacts ?? 0} />
        <Card title="فرصت‌های باز" value={kpiQuery.data?.open_deals ?? 0} />
        <Card title="کل پروژه‌ها" value={kpiQuery.data?.total_projects ?? 0} />
        <Card title="فعالیت‌های انجام‌شده" value={kpiQuery.data?.completed_activities ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-sm text-gray-800 mb-3">گزارش قیف فروش</h3>
          <ul className="space-y-2">
            {(pipelineQuery.data?.items || []).map((row) => (
              <li key={row.stage_id} className="flex justify-between text-sm border-b border-gray-100 pb-2">
                <span>{row.stage_name}</span>
                <span className="font-bold">{row.deals_count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-sm text-gray-800 mb-3">عملکرد کاربران</h3>
          <ul className="space-y-2">
            {(usersQuery.data?.items || []).map((row) => (
              <li key={row.user_id} className="text-sm border-b border-gray-100 pb-2">
                <div className="font-bold text-gray-800">{row.full_name}</div>
                <div className="text-xs text-gray-500 mt-1">فرصت: {row.deals_count} | فعالیت: {row.activities_count} | تیکت: {row.tickets_count}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 text-2xl font-black text-gray-900">{value}</div>
    </div>
  );
}
