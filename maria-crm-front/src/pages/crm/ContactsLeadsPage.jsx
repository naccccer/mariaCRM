import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { useAuth } from '../../features/auth/useAuth';
import {
  useContacts,
  useConvertLead,
  useCreateContact,
  useCreateLead,
  useLeads,
  useUpdateLead,
} from '../../hooks/useCrmApi';
import {
  contactStatusLabels,
  labelFromMap,
  leadStatusLabels,
  localizePipelineStage,
} from '../../lib/constants';
import { formatCurrency, formatDate } from '../../lib/formatters';

const leadStatusOptions = ['new', 'contacted', 'qualified', 'converted', 'lost'];

export default function ContactsLeadsPage() {
  const { hasPermission, hasAnyPermission } = useAuth();

  const canReadContacts = hasPermission('contacts.read');
  const canWriteContacts = hasPermission('contacts.write');
  const canReadLeads = hasPermission('leads.read');
  const canWriteLeads = hasPermission('leads.write');

  const hasAccess = hasAnyPermission(['contacts.read', 'leads.read']);

  const [tab, setTab] = useState(canReadContacts ? 'contacts' : 'leads');
  const [search, setSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('');

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  const [contactForm, setContactForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    budget: '',
    interest: '',
    type: 'buyer',
  });

  const [leadForm, setLeadForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    budget: '',
    interest: '',
    source: 'manual',
    status: 'new',
  });

  const activeTab = useMemo(() => {
    if (tab === 'contacts' && !canReadContacts && canReadLeads) {
      return 'leads';
    }

    if (tab === 'leads' && !canReadLeads && canReadContacts) {
      return 'contacts';
    }

    return tab;
  }, [canReadContacts, canReadLeads, tab]);

  const contactsQuery = useContacts(
    { search },
    {
      enabled: activeTab === 'contacts' && canReadContacts,
    },
  );

  const leadsQuery = useLeads(
    {
      search,
      status: leadStatusFilter,
    },
    {
      enabled: activeTab === 'leads' && canReadLeads,
    },
  );

  const createContactMutation = useCreateContact();
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const convertLeadMutation = useConvertLead();

  const activeQuery = activeTab === 'contacts' ? contactsQuery : leadsQuery;

  const contacts = useMemo(() => contactsQuery.data?.items || [], [contactsQuery.data]);
  const leads = useMemo(() => leadsQuery.data?.items || [], [leadsQuery.data]);

  async function submitContact(event) {
    event.preventDefault();

    await createContactMutation.mutateAsync({
      ...contactForm,
      budget: contactForm.budget ? Number(contactForm.budget) : null,
    });

    setContactModalOpen(false);
    setContactForm({ full_name: '', phone: '', email: '', budget: '', interest: '', type: 'buyer' });
  }

  async function submitLead(event) {
    event.preventDefault();

    await createLeadMutation.mutateAsync({
      ...leadForm,
      budget: leadForm.budget ? Number(leadForm.budget) : null,
    });

    setLeadModalOpen(false);
    setLeadForm({ full_name: '', phone: '', email: '', budget: '', interest: '', source: 'manual', status: 'new' });
  }

  async function onLeadStatusChange(id, status) {
    await updateLeadMutation.mutateAsync({ id, payload: { status } });
  }

  async function convertLead(id) {
    const confirmed = window.confirm('این سرنخ به مشتری و فرصت فروش تبدیل شود؟');
    if (!confirmed) {
      return;
    }

    await convertLeadMutation.mutateAsync(id);
  }

  if (!hasAccess) {
    return <EmptyState message="برای مشاهده این صفحه باید دسترسی مشتری یا سرنخ داشته باشید." />;
  }

  return (
    <div className="page-stack">
      <section className="panel">
        <div className="toolbar-wrap">
          <div className="tabs">
            {canReadContacts ? (
              <button
                type="button"
                className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
                onClick={() => setTab('contacts')}
              >
                مشتریان
              </button>
            ) : null}

            {canReadLeads ? (
              <button
                type="button"
                className={`tab-btn ${activeTab === 'leads' ? 'active' : ''}`}
                onClick={() => setTab('leads')}
              >
                سرنخ‌ها
              </button>
            ) : null}
          </div>

          <div className="toolbar-actions">
            <input
              type="search"
              placeholder="جستجو بر اساس نام یا موبایل"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {activeTab === 'leads' ? (
              <select value={leadStatusFilter} onChange={(event) => setLeadStatusFilter(event.target.value)}>
                <option value="">همه وضعیت‌ها</option>
                {leadStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {labelFromMap(leadStatusLabels, status)}
                  </option>
                ))}
              </select>
            ) : null}

            {activeTab === 'contacts' && canWriteContacts ? (
              <button type="button" className="btn btn-primary" onClick={() => setContactModalOpen(true)}>
                مشتری جدید
              </button>
            ) : null}

            {activeTab === 'leads' && canWriteLeads ? (
              <button type="button" className="btn btn-primary" onClick={() => setLeadModalOpen(true)}>
                سرنخ جدید
              </button>
            ) : null}
          </div>
        </div>

        {activeQuery.isLoading ? <LoadingState message="در حال دریافت داده‌ها..." /> : null}
        {activeQuery.error ? <ErrorState message={activeQuery.error.message} onRetry={activeQuery.refetch} /> : null}

        {activeTab === 'contacts' && !activeQuery.isLoading && !activeQuery.error ? (
          contacts.length === 0 ? (
            <EmptyState message="هنوز مشتری ثبت نشده است." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>نام</th>
                    <th>موبایل</th>
                    <th>عامل فروش</th>
                    <th>مرحله قیف</th>
                    <th>بودجه</th>
                    <th>وضعیت</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id}>
                      <td>
                        <strong>{contact.name}</strong>
                        <small>{formatDate(contact.created_at)}</small>
                      </td>
                      <td>{contact.phone}</td>
                      <td>{contact.agent || '---'}</td>
                      <td>{contact.pipeline_stage ? localizePipelineStage(contact.pipeline_stage) : 'بدون فرصت'}</td>
                      <td>{formatCurrency(contact.budget)}</td>
                      <td>
                        <Badge tone="success">{labelFromMap(contactStatusLabels, contact.status)}</Badge>
                      </td>
                      <td>
                        <Link className="btn btn-light" to={`/crm/contacts/${contact.id}`}>
                          پرونده مشتری
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : null}

        {activeTab === 'leads' && !activeQuery.isLoading && !activeQuery.error ? (
          leads.length === 0 ? (
            <EmptyState message="هنوز سرنخی ثبت نشده است." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>نام</th>
                    <th>موبایل</th>
                    <th>بودجه</th>
                    <th>علاقه‌مندی</th>
                    <th>وضعیت</th>
                    <th>مالک</th>
                    <th>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <strong>{lead.full_name}</strong>
                        <small>{formatDate(lead.created_at)}</small>
                      </td>
                      <td>{lead.phone}</td>
                      <td>{formatCurrency(lead.budget)}</td>
                      <td>{lead.interest || '---'}</td>
                      <td>
                        <select
                          value={lead.status}
                          disabled={!canWriteLeads || updateLeadMutation.isPending}
                          onChange={(event) => onLeadStatusChange(lead.id, event.target.value)}
                        >
                          {leadStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {labelFromMap(leadStatusLabels, status)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{lead.owner_name || '---'}</td>
                      <td>
                        <div className="row-actions">
                          {lead.status !== 'converted' && canWriteLeads ? (
                            <button
                              type="button"
                              className="btn btn-light"
                              onClick={() => convertLead(lead.id)}
                              disabled={convertLeadMutation.isPending}
                            >
                              تبدیل به مشتری
                            </button>
                          ) : (
                            <Badge tone="info">تبدیل شده</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : null}
      </section>

      <Modal open={contactModalOpen} onClose={() => setContactModalOpen(false)} title="ثبت مشتری جدید">
        <form className="form-grid" onSubmit={submitContact}>
          <label>
            <span>نام کامل</span>
            <input
              value={contactForm.full_name}
              onChange={(event) => setContactForm((prev) => ({ ...prev, full_name: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>موبایل</span>
            <input
              value={contactForm.phone}
              onChange={(event) => setContactForm((prev) => ({ ...prev, phone: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>ایمیل</span>
            <input
              type="email"
              value={contactForm.email}
              onChange={(event) => setContactForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>

          <label>
            <span>نوع مشتری</span>
            <select
              value={contactForm.type}
              onChange={(event) => setContactForm((prev) => ({ ...prev, type: event.target.value }))}
            >
              <option value="buyer">خریدار</option>
              <option value="investor">سرمایه‌گذار</option>
              <option value="partner">همکار</option>
            </select>
          </label>

          <label>
            <span>بودجه</span>
            <input
              type="number"
              value={contactForm.budget}
              onChange={(event) => setContactForm((prev) => ({ ...prev, budget: event.target.value }))}
            />
          </label>

          <label>
            <span>علاقه‌مندی</span>
            <input
              value={contactForm.interest}
              onChange={(event) => setContactForm((prev) => ({ ...prev, interest: event.target.value }))}
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={createContactMutation.isPending}>
            {createContactMutation.isPending ? 'در حال ثبت...' : 'ثبت مشتری'}
          </button>
        </form>
      </Modal>

      <Modal open={leadModalOpen} onClose={() => setLeadModalOpen(false)} title="ثبت سرنخ جدید">
        <form className="form-grid" onSubmit={submitLead}>
          <label>
            <span>نام کامل</span>
            <input
              value={leadForm.full_name}
              onChange={(event) => setLeadForm((prev) => ({ ...prev, full_name: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>موبایل</span>
            <input
              value={leadForm.phone}
              onChange={(event) => setLeadForm((prev) => ({ ...prev, phone: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>ایمیل</span>
            <input
              type="email"
              value={leadForm.email}
              onChange={(event) => setLeadForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>

          <label>
            <span>منبع</span>
            <input
              value={leadForm.source}
              onChange={(event) => setLeadForm((prev) => ({ ...prev, source: event.target.value }))}
            />
          </label>

          <label>
            <span>بودجه</span>
            <input
              type="number"
              value={leadForm.budget}
              onChange={(event) => setLeadForm((prev) => ({ ...prev, budget: event.target.value }))}
            />
          </label>

          <label>
            <span>علاقه‌مندی</span>
            <input
              value={leadForm.interest}
              onChange={(event) => setLeadForm((prev) => ({ ...prev, interest: event.target.value }))}
            />
          </label>

          <label>
            <span>وضعیت</span>
            <select
              value={leadForm.status}
              onChange={(event) => setLeadForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              {leadStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {labelFromMap(leadStatusLabels, status)}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="btn btn-primary" disabled={createLeadMutation.isPending}>
            {createLeadMutation.isPending ? 'در حال ثبت...' : 'ثبت سرنخ'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
