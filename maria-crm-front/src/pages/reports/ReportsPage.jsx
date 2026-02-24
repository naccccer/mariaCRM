import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import StatCard from '../../components/ui/StatCard';
import {
  useReportsKpi,
  useReportsPipeline,
  useReportsUsers,
} from '../../hooks/useCrmApi';
import { localizePipelineStage } from '../../lib/constants';
import { formatNumber } from '../../lib/formatters';

export default function ReportsPage() {
  const kpiQuery = useReportsKpi();
  const pipelineQuery = useReportsPipeline();
  const usersQuery = useReportsUsers();

  if (kpiQuery.isLoading || pipelineQuery.isLoading || usersQuery.isLoading) {
    return <LoadingState message="در حال بارگذاری گزارش‌ها..." />;
  }

  if (kpiQuery.error || pipelineQuery.error || usersQuery.error) {
    return (
      <ErrorState
        message={kpiQuery.error?.message || pipelineQuery.error?.message || usersQuery.error?.message}
        onRetry={() => {
          kpiQuery.refetch();
          pipelineQuery.refetch();
          usersQuery.refetch();
        }}
      />
    );
  }

  const kpi = kpiQuery.data || {};
  const pipeline = pipelineQuery.data?.items || [];
  const users = usersQuery.data?.items || [];

  const maxPipeline = Math.max(...pipeline.map((item) => item.deals_count), 1);

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <StatCard label="کل مشتریان" value={kpi.total_contacts || 0} />
        <StatCard label="معامله باز" value={kpi.open_deals || 0} />
        <StatCard label="پروژه فعال" value={kpi.total_projects || 0} />
        <StatCard label="فعالیت تکمیل‌شده" value={kpi.completed_activities || 0} />
      </section>

      <section className="grid-2">
        <article className="panel">
          <div className="panel-head">
            <h2>گزارش قیف فروش</h2>
          </div>

          {pipeline.length === 0 ? (
            <EmptyState message="داده‌ای برای قیف فروش وجود ندارد." />
          ) : (
            <div className="bar-list">
              {pipeline.map((item) => (
                <div key={item.stage_id} className="bar-row">
                  <div className="bar-label">
                    <strong>{localizePipelineStage(item.stage_name)}</strong>
                    <span>{formatNumber(item.deals_count)} فرصت</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.max((item.deals_count / maxPipeline) * 100, 6)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>عملکرد کاربران</h2>
          </div>

          {users.length === 0 ? (
            <EmptyState message="داده‌ای برای عملکرد کاربران موجود نیست." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>کاربر</th>
                    <th>تعداد معاملات</th>
                    <th>فعالیت‌ها</th>
                    <th>تیکت‌ها</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.user_id}>
                      <td>{user.full_name}</td>
                      <td>{formatNumber(user.deals_count)}</td>
                      <td>{formatNumber(user.activities_count)}</td>
                      <td>{formatNumber(user.tickets_count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
