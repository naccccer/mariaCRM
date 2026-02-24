import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { useAuth } from '../../features/auth/useAuth';
import {
  useActivities,
  useContact,
  useContactTimeline,
  useCreateActivity,
  useDeals,
} from '../../hooks/useCrmApi';
import {
  activityStatusLabels,
  activityTypeLabels,
  contactTypeLabels,
  dealStatusLabels,
  labelFromMap,
  localizePipelineStage,
  localizeTimelineText,
} from '../../lib/constants';
import { formatCurrency, formatDateTime } from '../../lib/formatters';

function toApiDateTime(value) {
  if (!value) {
    return null;
  }

  return value.length === 16 ? `${value.replace('T', ' ')}:00` : value.replace('T', ' ');
}

function timelineTitle(itemType) {
  if (itemType === 'activity') {
    return 'فعالیت';
  }

  if (itemType === 'deal_stage') {
    return 'تغییر مرحله فروش';
  }

  if (itemType === 'note') {
    return 'یادداشت';
  }

  return 'رویداد';
}

export default function ContactProfilePage() {
  const { contactId } = useParams();
  const { hasPermission } = useAuth();

  const canReadContact = hasPermission('contacts.read');
  const canReadDeals = hasPermission('deals.read');
  const canReadActivities = hasPermission('activities.read');
  const canWriteActivities = hasPermission('activities.write');

  const contactQuery = useContact(contactId, { enabled: canReadContact });
  const timelineQuery = useContactTimeline(contactId, { enabled: canReadContact });
  const dealsQuery = useDeals({ contact_id: contactId }, { enabled: canReadDeals });
  const activitiesQuery = useActivities({ contact_id: contactId }, { enabled: canReadActivities });

  const createActivityMutation = useCreateActivity();

  const [activityForm, setActivityForm] = useState({
    title: 'پیگیری تلفنی',
    description: '',
    due_at: '',
    type: 'follow_up',
  });

  const contact = contactQuery.data?.contact;
  const timeline = timelineQuery.data?.items || [];
  const deals = dealsQuery.data?.items || [];
  const activities = activitiesQuery.data?.items || [];
  const activeDeal = deals.find((deal) => deal.status === 'open') || deals[0] || null;

  async function submitActivity(event) {
    event.preventDefault();

    await createActivityMutation.mutateAsync({
      ...activityForm,
      contact_id: Number(contactId),
      due_at: toApiDateTime(activityForm.due_at),
    });

    setActivityForm({ title: 'پیگیری تلفنی', description: '', due_at: '', type: 'follow_up' });
  }

  if (!canReadContact) {
    return <EmptyState message="برای مشاهده پرونده مشتری باید مجوز contacts.read داشته باشید." />;
  }

  if (contactQuery.isLoading) {
    return <LoadingState message="در حال دریافت پرونده مشتری..." />;
  }

  if (contactQuery.error) {
    return <ErrorState message={contactQuery.error.message} onRetry={contactQuery.refetch} />;
  }

  if (!contact) {
    return <EmptyState message="پرونده‌ای برای این مشتری پیدا نشد." />;
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>{contact.name}</h2>
            <p className="muted">{contact.phone}</p>
          </div>
          <Link className="btn btn-light" to="/crm">
            بازگشت به لیست مشتریان
          </Link>
        </div>

        <div className="detail-grid">
          <article className="detail-item">
            <h4>اطلاعات پایه</h4>
            <p>ایمیل: {contact.email || '---'}</p>
            <p>نوع: {labelFromMap(contactTypeLabels, contact.type)}</p>
            <p>عامل فروش: {contact.agent || '---'}</p>
            <p>بودجه: {formatCurrency(contact.budget)}</p>
            <p>علاقه‌مندی: {contact.interest || '---'}</p>
          </article>

          <article className="detail-item">
            <h4>وضعیت فروش</h4>
            {activeDeal ? (
              <>
                <p>فرصت جاری: {activeDeal.title}</p>
                <p>مرحله فعلی: {localizePipelineStage(activeDeal.stage_name)}</p>
                <p>ارزش معامله: {formatCurrency(activeDeal.amount)}</p>
                <Badge tone={activeDeal.status === 'won' ? 'success' : 'info'}>
                  {labelFromMap(dealStatusLabels, activeDeal.status)}
                </Badge>
              </>
            ) : (
              <p className="muted">برای این مشتری هنوز معامله ثبت نشده است.</p>
            )}
          </article>

          <article className="detail-item">
            <h4>فعالیت‌های ثبت‌شده</h4>
            {canReadActivities ? (
              activities.length > 0 ? (
                <ul className="mini-list">
                  {activities.slice(0, 5).map((activity) => (
                    <li key={activity.id}>
                      <strong>{activity.title}</strong>
                      <small>
                        {labelFromMap(activityTypeLabels, activity.type)} -
                        {labelFromMap(activityStatusLabels, activity.status)}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">فعالیتی ثبت نشده است.</p>
              )
            ) : (
              <p className="muted">مجوز مشاهده فعالیت‌ها ندارید.</p>
            )}
          </article>
        </div>
      </section>

      <section className="grid-2">
        <article className="panel">
          <div className="panel-head">
            <h3>تایم‌لاین پرونده</h3>
          </div>

          {timelineQuery.isLoading ? <LoadingState message="در حال دریافت تایم‌لاین..." /> : null}
          {timelineQuery.error ? <ErrorState message={timelineQuery.error.message} onRetry={timelineQuery.refetch} /> : null}

          {!timelineQuery.isLoading && !timelineQuery.error && timeline.length === 0 ? (
            <EmptyState message="برای این پرونده رویدادی ثبت نشده است." />
          ) : null}

          {timeline.length > 0 ? (
            <ul className="timeline-list">
              {timeline.map((item) => (
                <li key={`${item.item_type}-${item.id}`}>
                  <div>
                    <strong>{timelineTitle(item.item_type)}</strong>
                    <p>{localizeTimelineText(item.title || item.text)}</p>
                  </div>
                  <small>{formatDateTime(item.happened_at)}</small>
                </li>
              ))}
            </ul>
          ) : null}
        </article>

        <article className="panel">
          <div className="panel-head">
            <h3>ثبت پیگیری جدید</h3>
          </div>

          {!canWriteActivities ? (
            <EmptyState message="برای ثبت فعالیت باید مجوز activities.write داشته باشید." />
          ) : (
            <form className="form-grid" onSubmit={submitActivity}>
              <label>
                <span>عنوان پیگیری</span>
                <input
                  value={activityForm.title}
                  onChange={(event) => setActivityForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
              </label>

              <label>
                <span>نوع</span>
                <select
                  value={activityForm.type}
                  onChange={(event) => setActivityForm((prev) => ({ ...prev, type: event.target.value }))}
                >
                  <option value="follow_up">پیگیری</option>
                  <option value="task">وظیفه</option>
                  <option value="meeting">جلسه</option>
                  <option value="call">تماس</option>
                </select>
              </label>

              <label>
                <span>زمان انجام</span>
                <input
                  type="datetime-local"
                  value={activityForm.due_at}
                  onChange={(event) => setActivityForm((prev) => ({ ...prev, due_at: event.target.value }))}
                />
              </label>

              <label>
                <span>توضیحات</span>
                <textarea
                  rows={3}
                  value={activityForm.description}
                  onChange={(event) => setActivityForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </label>

              <button type="submit" className="btn btn-primary" disabled={createActivityMutation.isPending}>
                {createActivityMutation.isPending ? 'در حال ثبت...' : 'ثبت پیگیری'}
              </button>
            </form>
          )}
        </article>
      </section>
    </div>
  );
}
