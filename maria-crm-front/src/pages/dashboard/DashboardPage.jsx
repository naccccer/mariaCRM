import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import {
  useActivities,
  useDeals,
  useReportsKpi,
  useTickets,
} from '../../hooks/useCrmApi';
import {
  activityStatusLabels,
  labelFromMap,
  localizePipelineStage,
  ticketPriorityLabels,
  ticketStatusLabels,
} from '../../lib/constants';
import { formatCurrency, formatDateTime } from '../../lib/formatters';

export default function DashboardPage() {
  const { hasPermission } = useAuth();

  const canReadReports = hasPermission('reports.read');
  const canReadDeals = hasPermission('deals.read');
  const canReadActivities = hasPermission('activities.read');
  const canReadTickets = hasPermission('tickets.read');

  const kpiQuery = useReportsKpi({ enabled: canReadReports });
  const dealsQuery = useDeals({}, { enabled: canReadDeals });
  const activitiesQuery = useActivities({}, { enabled: canReadActivities });
  const ticketsQuery = useTickets({}, { enabled: canReadTickets });

  if (!canReadReports && !canReadDeals && !canReadActivities && !canReadTickets) {
    return <EmptyState message="برای مشاهده داشبورد، دسترسی لازم تعریف نشده است." />;
  }

  if (kpiQuery.isLoading && canReadReports) {
    return <LoadingState message="در حال بارگذاری داشبورد..." />;
  }

  if (kpiQuery.error && canReadReports) {
    return <ErrorState message={kpiQuery.error.message} onRetry={kpiQuery.refetch} />;
  }

  const kpi = kpiQuery.data || {
    total_contacts: 0,
    open_deals: 0,
    total_projects: 0,
    completed_activities: 0,
  };

  const recentDeals = (dealsQuery.data?.items || []).slice(0, 5);
  const upcomingActivities = (activitiesQuery.data?.items || []).slice(0, 6);
  const recentTickets = (ticketsQuery.data?.items || []).slice(0, 5);

  return (
    <div className="page-stack">
      <section className="stats-grid">
        <StatCard label="کل مشتریان" value={kpi.total_contacts} hint="مجموع مخاطبان ثبت‌شده" />
        <StatCard label="معامله‌های باز" value={kpi.open_deals} hint="فرصت‌های فعال فروش" />
        <StatCard label="پروژه‌های فعال" value={kpi.total_projects} hint="پروژه‌های موجود در سیستم" />
        <StatCard label="فعالیت تکمیل‌شده" value={kpi.completed_activities} hint="کارهای انجام‌شده" />
      </section>

      <section className="grid-2">
        <article className="panel">
          <div className="panel-head">
            <h2>فرصت‌های فروش اخیر</h2>
            <Link to="/deals" className="text-link">
              مشاهده قیف
            </Link>
          </div>

          {dealsQuery.isLoading ? <LoadingState message="در حال دریافت فرصت‌ها..." /> : null}
          {dealsQuery.error ? <ErrorState message={dealsQuery.error.message} onRetry={dealsQuery.refetch} /> : null}
          {!dealsQuery.isLoading && !dealsQuery.error && recentDeals.length === 0 ? (
            <EmptyState message="معامله‌ای ثبت نشده است." />
          ) : null}

          {recentDeals.length > 0 ? (
            <div className="list-stack">
              {recentDeals.map((deal) => (
                <div className="list-item" key={deal.id}>
                  <div>
                    <strong>{deal.title}</strong>
                    <small>{deal.contact_name}</small>
                  </div>
                  <div className="list-meta">
                    <span>{formatCurrency(deal.amount)}</span>
                    <Badge tone="info">{localizePipelineStage(deal.stage_name)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>پیگیری‌های پیش‌رو</h2>
            <Link to="/activities" className="text-link">
              مدیریت فعالیت‌ها
            </Link>
          </div>

          {activitiesQuery.isLoading ? <LoadingState message="در حال دریافت فعالیت‌ها..." /> : null}
          {activitiesQuery.error ? <ErrorState message={activitiesQuery.error.message} onRetry={activitiesQuery.refetch} /> : null}
          {!activitiesQuery.isLoading && !activitiesQuery.error && upcomingActivities.length === 0 ? (
            <EmptyState message="فعالیتی ثبت نشده است." />
          ) : null}

          {upcomingActivities.length > 0 ? (
            <div className="list-stack">
              {upcomingActivities.map((activity) => (
                <div className="list-item" key={activity.id}>
                  <div>
                    <strong>{activity.title}</strong>
                    <small>{activity.client || 'بدون مشتری'}</small>
                  </div>
                  <div className="list-meta">
                    <span>{formatDateTime(activity.due_at)}</span>
                    <Badge tone={activity.status === 'done' ? 'success' : 'warning'}>
                      {labelFromMap(activityStatusLabels, activity.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>

      <article className="panel">
        <div className="panel-head">
          <h2>تیکت‌های اخیر</h2>
          <Link to="/tickets" className="text-link">
            مشاهده تیکت‌ها
          </Link>
        </div>

        {ticketsQuery.isLoading ? <LoadingState message="در حال دریافت تیکت‌ها..." /> : null}
        {ticketsQuery.error ? <ErrorState message={ticketsQuery.error.message} onRetry={ticketsQuery.refetch} /> : null}
        {!ticketsQuery.isLoading && !ticketsQuery.error && recentTickets.length === 0 ? (
          <EmptyState message="تیکتی ثبت نشده است." />
        ) : null}

        {recentTickets.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>موضوع</th>
                  <th>مشتری</th>
                  <th>وضعیت</th>
                  <th>اولویت</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>{ticket.subject}</td>
                    <td>{ticket.contact_name || '---'}</td>
                    <td>{labelFromMap(ticketStatusLabels, ticket.status)}</td>
                    <td>{labelFromMap(ticketPriorityLabels, ticket.priority)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </article>
    </div>
  );
}
