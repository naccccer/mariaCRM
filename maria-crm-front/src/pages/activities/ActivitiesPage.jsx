import { useState } from 'react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { useAuth } from '../../features/auth/useAuth';
import {
  useActivities,
  useCompleteActivity,
  useContacts,
  useCreateActivity,
  useUpdateActivity,
} from '../../hooks/useCrmApi';
import { activityStatusLabels, activityTypeLabels, labelFromMap } from '../../lib/constants';
import { formatDateTime } from '../../lib/formatters';

function toApiDateTime(value) {
  if (!value) {
    return null;
  }

  return value.length === 16 ? `${value.replace('T', ' ')}:00` : value.replace('T', ' ');
}

export default function ActivitiesPage() {
  const { hasPermission } = useAuth();

  const canWrite = hasPermission('activities.write');
  const canReadContacts = hasPermission('contacts.read');

  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    contact_id: '',
    title: '',
    description: '',
    type: 'follow_up',
    due_at: '',
    status: 'todo',
  });

  const activitiesQuery = useActivities({ status: statusFilter });
  const contactsQuery = useContacts({}, { enabled: canReadContacts });

  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();
  const completeActivityMutation = useCompleteActivity();

  async function submitActivity(event) {
    event.preventDefault();

    await createActivityMutation.mutateAsync({
      ...form,
      contact_id: form.contact_id ? Number(form.contact_id) : null,
      due_at: toApiDateTime(form.due_at),
    });

    setModalOpen(false);
    setForm({ contact_id: '', title: '', description: '', type: 'follow_up', due_at: '', status: 'todo' });
  }

  async function changeStatus(activityId, status) {
    await updateActivityMutation.mutateAsync({ id: activityId, payload: { status } });
  }

  async function completeActivity(activityId) {
    await completeActivityMutation.mutateAsync(activityId);
  }

  const items = activitiesQuery.data?.items || [];

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="toolbar-wrap">
          <div>
            <h2>فعالیت‌ها و پیگیری‌ها</h2>
            <p className="muted">کارهای روزانه تیم فروش و پشتیبانی را مدیریت کنید.</p>
          </div>

          <div className="toolbar-actions">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">همه وضعیت‌ها</option>
              <option value="todo">در انتظار</option>
              <option value="in_progress">در حال انجام</option>
              <option value="done">انجام شده</option>
            </select>

            {canWrite ? (
              <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
                فعالیت جدید
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {activitiesQuery.isLoading ? <LoadingState message="در حال دریافت فعالیت‌ها..." /> : null}
      {activitiesQuery.error ? <ErrorState message={activitiesQuery.error.message} onRetry={activitiesQuery.refetch} /> : null}

      {!activitiesQuery.isLoading && !activitiesQuery.error && items.length === 0 ? (
        <EmptyState message="فعالیتی برای این فیلتر پیدا نشد." />
      ) : null}

      {items.length > 0 ? (
        <section className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>عنوان</th>
                  <th>مشتری</th>
                  <th>نوع</th>
                  <th>موعد</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((activity) => (
                  <tr key={activity.id}>
                    <td>
                      <strong>{activity.title}</strong>
                      <small>{activity.description || '---'}</small>
                    </td>
                    <td>{activity.client || '---'}</td>
                    <td>{labelFromMap(activityTypeLabels, activity.type)}</td>
                    <td>{formatDateTime(activity.due_at)}</td>
                    <td>
                      <Badge tone={activity.status === 'done' ? 'success' : 'warning'}>
                        {labelFromMap(activityStatusLabels, activity.status)}
                      </Badge>
                    </td>
                    <td>
                      <div className="row-actions">
                        {canWrite ? (
                          <select
                            value={activity.status}
                            onChange={(event) => changeStatus(activity.id, event.target.value)}
                            disabled={updateActivityMutation.isPending}
                          >
                            <option value="todo">در انتظار</option>
                            <option value="in_progress">در حال انجام</option>
                            <option value="done">انجام شده</option>
                          </select>
                        ) : null}

                        {canWrite && activity.status !== 'done' ? (
                          <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => completeActivity(activity.id)}
                            disabled={completeActivityMutation.isPending}
                          >
                            تکمیل
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="ثبت فعالیت جدید">
        <form className="form-grid" onSubmit={submitActivity}>
          <label>
            <span>عنوان</span>
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>مشتری</span>
            <select
              value={form.contact_id}
              onChange={(event) => setForm((prev) => ({ ...prev, contact_id: event.target.value }))}
            >
              <option value="">بدون مشتری</option>
              {(contactsQuery.data?.items || []).map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>نوع</span>
            <select
              value={form.type}
              onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}
            >
              <option value="follow_up">پیگیری</option>
              <option value="task">وظیفه</option>
              <option value="meeting">جلسه</option>
              <option value="call">تماس</option>
            </select>
          </label>

          <label>
            <span>زمان</span>
            <input
              type="datetime-local"
              value={form.due_at}
              onChange={(event) => setForm((prev) => ({ ...prev, due_at: event.target.value }))}
            />
          </label>

          <label>
            <span>وضعیت اولیه</span>
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="todo">در انتظار</option>
              <option value="in_progress">در حال انجام</option>
              <option value="done">انجام شده</option>
            </select>
          </label>

          <label>
            <span>توضیحات</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={createActivityMutation.isPending}>
            {createActivityMutation.isPending ? 'در حال ثبت...' : 'ثبت فعالیت'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
