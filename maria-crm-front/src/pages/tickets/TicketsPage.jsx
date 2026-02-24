import { useState } from 'react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { useAuth } from '../../features/auth/useAuth';
import {
  useAddTicketComment,
  useContacts,
  useCreateTicket,
  useTickets,
  useUpdateTicket,
} from '../../hooks/useCrmApi';
import {
  labelFromMap,
  ticketPriorityLabels,
  ticketStatusLabels,
} from '../../lib/constants';
import { formatDateTime } from '../../lib/formatters';

function toApiDateTime(value) {
  if (!value) {
    return null;
  }

  return value.length === 16 ? `${value.replace('T', ' ')}:00` : value.replace('T', ' ');
}

export default function TicketsPage() {
  const { hasPermission } = useAuth();

  const canWrite = hasPermission('tickets.write');
  const canReadContacts = hasPermission('contacts.read');

  const [statusFilter, setStatusFilter] = useState('');
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState(null);

  const [ticketForm, setTicketForm] = useState({
    contact_id: '',
    subject: '',
    description: '',
    priority: 'normal',
    status: 'open',
    sla_due_at: '',
  });

  const [commentBody, setCommentBody] = useState('');

  const ticketsQuery = useTickets({ status: statusFilter });
  const contactsQuery = useContacts({}, { enabled: canReadContacts });

  const createTicketMutation = useCreateTicket();
  const updateTicketMutation = useUpdateTicket();
  const addCommentMutation = useAddTicketComment();

  async function submitTicket(event) {
    event.preventDefault();

    await createTicketMutation.mutateAsync({
      ...ticketForm,
      contact_id: ticketForm.contact_id ? Number(ticketForm.contact_id) : null,
      sla_due_at: toApiDateTime(ticketForm.sla_due_at),
    });

    setTicketModalOpen(false);
    setTicketForm({
      contact_id: '',
      subject: '',
      description: '',
      priority: 'normal',
      status: 'open',
      sla_due_at: '',
    });
  }

  async function changeStatus(ticketId, status) {
    await updateTicketMutation.mutateAsync({ id: ticketId, payload: { status } });
  }

  async function submitComment(event) {
    event.preventDefault();

    if (!activeTicketId) {
      return;
    }

    await addCommentMutation.mutateAsync({ id: activeTicketId, payload: { body: commentBody } });

    setCommentModalOpen(false);
    setActiveTicketId(null);
    setCommentBody('');
  }

  const items = ticketsQuery.data?.items || [];

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="toolbar-wrap">
          <div>
            <h2>تیکت‌ها</h2>
            <p className="muted">درخواست‌های مشتریان را با مهلت پاسخ و وضعیت مدیریت کنید.</p>
          </div>

          <div className="toolbar-actions">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">همه وضعیت‌ها</option>
              <option value="open">باز</option>
              <option value="pending">در انتظار</option>
              <option value="resolved">حل شده</option>
              <option value="closed">بسته</option>
            </select>

            {canWrite ? (
              <button type="button" className="btn btn-primary" onClick={() => setTicketModalOpen(true)}>
                تیکت جدید
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {ticketsQuery.isLoading ? <LoadingState message="در حال دریافت تیکت‌ها..." /> : null}
      {ticketsQuery.error ? <ErrorState message={ticketsQuery.error.message} onRetry={ticketsQuery.refetch} /> : null}

      {!ticketsQuery.isLoading && !ticketsQuery.error && items.length === 0 ? (
        <EmptyState message="تیکتی برای این فیلتر پیدا نشد." />
      ) : null}

      {items.length > 0 ? (
        <section className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>موضوع</th>
                  <th>مشتری</th>
                  <th>اولویت</th>
                  <th>وضعیت</th>
                  <th>مهلت پاسخ</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>
                      <strong>{ticket.subject}</strong>
                      <small>ثبت: {formatDateTime(ticket.created_at)}</small>
                    </td>
                    <td>{ticket.contact_name || '---'}</td>
                    <td>{labelFromMap(ticketPriorityLabels, ticket.priority)}</td>
                    <td>
                      <Badge tone={ticket.status === 'resolved' || ticket.status === 'closed' ? 'success' : 'warning'}>
                        {labelFromMap(ticketStatusLabels, ticket.status)}
                      </Badge>
                    </td>
                    <td>{formatDateTime(ticket.sla_due_at)}</td>
                    <td>
                      <div className="row-actions">
                        {canWrite ? (
                          <select
                            value={ticket.status}
                            onChange={(event) => changeStatus(ticket.id, event.target.value)}
                            disabled={updateTicketMutation.isPending}
                          >
                            <option value="open">باز</option>
                            <option value="pending">در انتظار</option>
                            <option value="resolved">حل شده</option>
                            <option value="closed">بسته</option>
                          </select>
                        ) : null}

                        {canWrite ? (
                          <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => {
                              setActiveTicketId(ticket.id);
                              setCommentModalOpen(true);
                            }}
                          >
                            ثبت کامنت
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

      <Modal open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} title="ثبت تیکت جدید" size="lg">
        <form className="form-grid" onSubmit={submitTicket}>
          <label>
            <span>موضوع</span>
            <input
              value={ticketForm.subject}
              onChange={(event) => setTicketForm((prev) => ({ ...prev, subject: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>مشتری</span>
            <select
              value={ticketForm.contact_id}
              onChange={(event) => setTicketForm((prev) => ({ ...prev, contact_id: event.target.value }))}
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
            <span>اولویت</span>
            <select
              value={ticketForm.priority}
              onChange={(event) => setTicketForm((prev) => ({ ...prev, priority: event.target.value }))}
            >
              <option value="low">کم</option>
              <option value="normal">عادی</option>
              <option value="high">بالا</option>
              <option value="urgent">فوری</option>
            </select>
          </label>

          <label>
            <span>وضعیت</span>
            <select
              value={ticketForm.status}
              onChange={(event) => setTicketForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="open">باز</option>
              <option value="pending">در انتظار</option>
              <option value="resolved">حل شده</option>
              <option value="closed">بسته</option>
            </select>
          </label>

          <label>
            <span>مهلت پاسخ</span>
            <input
              type="datetime-local"
              value={ticketForm.sla_due_at}
              onChange={(event) => setTicketForm((prev) => ({ ...prev, sla_due_at: event.target.value }))}
            />
          </label>

          <label>
            <span>توضیحات</span>
            <textarea
              rows={3}
              value={ticketForm.description}
              onChange={(event) => setTicketForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={createTicketMutation.isPending}>
            {createTicketMutation.isPending ? 'در حال ثبت...' : 'ثبت تیکت'}
          </button>
        </form>
      </Modal>

      <Modal open={commentModalOpen} onClose={() => setCommentModalOpen(false)} title="ثبت کامنت روی تیکت">
        <form className="form-grid" onSubmit={submitComment}>
          <label>
            <span>متن کامنت</span>
            <textarea
              rows={4}
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              required
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={addCommentMutation.isPending}>
            {addCommentMutation.isPending ? 'در حال ارسال...' : 'ثبت کامنت'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
