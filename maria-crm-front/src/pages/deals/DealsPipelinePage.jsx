import { useState } from 'react';
import { BarChart3, Filter, List, Plus, RefreshCcw, User } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/Feedback';
import { useAuth } from '../../features/auth/useAuth';
import {
  useContacts,
  useCreateDeal,
  useDeals,
  useMoveDealStage,
} from '../../hooks/useCrmApi';
import { dealStatusLabels, labelFromMap, localizePipelineStage } from '../../lib/constants';
import { formatCurrency, formatDate } from '../../lib/formatters';

function toApiDateTime(value) {
  if (!value) {
    return null;
  }

  return value.length === 16 ? `${value.replace('T', ' ')}:00` : value.replace('T', ' ');
}

export default function DealsPipelinePage() {
  const { hasPermission } = useAuth();

  const canWriteDeals = hasPermission('deals.write');
  const canReadContacts = hasPermission('contacts.read');

  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('today');
  const [viewMode, setViewMode] = useState('list');
  const [dealModalOpen, setDealModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    contact_id: '',
    amount: '',
    status: 'open',
    stage_id: '',
    expected_close_at: '',
  });

  const dealsQuery = useDeals({ status: statusFilter });
  const contactsQuery = useContacts({}, { enabled: canReadContacts });

  const createDealMutation = useCreateDeal();
  const moveStageMutation = useMoveDealStage();

  const stages = dealsQuery.data?.stages || [];
  const deals = dealsQuery.data?.items || [];

  const groupedStages = stages.map((stage) => ({
    ...stage,
    items: deals.filter((deal) => Number(deal.stage_id) === Number(stage.id)),
  }));

  function openCreateDeal(stageId = '') {
    setForm((prev) => ({
      ...prev,
      stage_id: stageId ? String(stageId) : '',
    }));
    setDealModalOpen(true);
  }

  async function submitDeal(event) {
    event.preventDefault();

    await createDealMutation.mutateAsync({
      ...form,
      contact_id: Number(form.contact_id),
      amount: Number(form.amount || 0),
      stage_id: form.stage_id ? Number(form.stage_id) : undefined,
      expected_close_at: toApiDateTime(form.expected_close_at),
    });

    setDealModalOpen(false);
    setForm({ title: '', contact_id: '', amount: '', status: 'open', stage_id: '', expected_close_at: '' });
  }

  async function onStageChange(dealId, stageId) {
    await moveStageMutation.mutateAsync({ id: dealId, stage_id: Number(stageId) });
  }

  return (
    <div className="page-stack deals-didar">
      <section className="panel deals-toolbar">
        <div className="deals-toolbar-row">
          <div className="deals-toolbar-actions">
            <button type="button" className="btn btn-light">
              <Filter size={16} />
              فیلتر کاربر
            </button>

            {canWriteDeals ? (
              <button type="button" className="btn btn-primary" onClick={() => openCreateDeal('')}>
                <Plus size={16} />
                افزودن معامله
              </button>
            ) : null}
          </div>

          <div className="deals-toolbar-actions">
            <button type="button" className="btn btn-light">
              <RefreshCcw size={16} />
              بروزرسانی سریع صفحه
            </button>

            <div className="segmented">
              <button
                type="button"
                className={periodFilter === 'all' ? 'active' : ''}
                onClick={() => setPeriodFilter('all')}
              >
                همه
              </button>
              <button
                type="button"
                className={periodFilter === 'today' ? 'active' : ''}
                onClick={() => setPeriodFilter('today')}
              >
                امروز و تاریخ گذشته
              </button>
            </div>
          </div>
        </div>

        <div className="deals-toolbar-row compact">
          <div className="deals-toolbar-actions">
            <div className="segmented">
              <button type="button" className={viewMode === 'user' ? 'active' : ''} onClick={() => setViewMode('user')}>
                <User size={14} />
                کاربر
              </button>
              <button type="button" className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
                <List size={14} />
                لیست
              </button>
              <button
                type="button"
                className={viewMode === 'forecast' ? 'active' : ''}
                onClick={() => setViewMode('forecast')}
              >
                <BarChart3 size={14} />
                پیش بینی
              </button>
            </div>

            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">همه وضعیت‌ها</option>
              <option value="open">باز</option>
              <option value="won">موفق</option>
              <option value="lost">ناموفق</option>
            </select>
          </div>
        </div>
      </section>

      {dealsQuery.isLoading ? <LoadingState message="در حال دریافت قیف فروش..." /> : null}
      {dealsQuery.error ? <ErrorState message={dealsQuery.error.message} onRetry={dealsQuery.refetch} /> : null}

      {!dealsQuery.isLoading && !dealsQuery.error && groupedStages.length === 0 ? (
        <EmptyState message="مرحله‌ای برای قیف فروش تعریف نشده است." />
      ) : null}

      {!dealsQuery.isLoading && !dealsQuery.error && groupedStages.length > 0 ? (
        <section className="kanban-grid didar-kanban">
          {groupedStages.map((stage) => (
            <article key={stage.id} className="kanban-column didar-column">
              <header className="stage-ribbon">
                <h3>{localizePipelineStage(stage.name)}</h3>
                <Badge tone="info">{stage.items.length} فرصت</Badge>
              </header>

              {canWriteDeals ? (
                <button type="button" className="quick-add-deal" onClick={() => openCreateDeal(stage.id)}>
                  افزودن سریع معامله
                </button>
              ) : null}

              {stage.items.length === 0 ? (
                <div className="quick-placeholder-list">
                  <button type="button" className="quick-placeholder" onClick={() => openCreateDeal(stage.id)}>
                    +
                  </button>
                  <button type="button" className="quick-placeholder" onClick={() => openCreateDeal(stage.id)}>
                    +
                  </button>
                  <button type="button" className="quick-placeholder" onClick={() => openCreateDeal(stage.id)}>
                    +
                  </button>
                </div>
              ) : (
                <div className="kanban-cards">
                  {stage.items.map((deal) => (
                    <div key={deal.id} className="kanban-card didar-card">
                      <strong>{deal.title}</strong>
                      <small>{deal.contact_name || 'بدون مشتری'}</small>
                      <p>{formatCurrency(deal.amount)}</p>
                      <p className="muted">ثبت: {formatDate(deal.created_at)}</p>

                      <div className="kanban-actions">
                        <Badge tone={deal.status === 'won' ? 'success' : deal.status === 'lost' ? 'danger' : 'warning'}>
                          {labelFromMap(dealStatusLabels, deal.status)}
                        </Badge>

                        {canWriteDeals ? (
                          <select
                            value={deal.stage_id || ''}
                            onChange={(event) => onStageChange(deal.id, event.target.value)}
                            disabled={moveStageMutation.isPending}
                          >
                            {stages.map((stageOption) => (
                              <option key={stageOption.id} value={stageOption.id}>
                                {localizePipelineStage(stageOption.name)}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {canWriteDeals && stage.items.length < 3
                    ? Array.from({ length: 3 - stage.items.length }).map((_, index) => (
                        <button
                          key={`${stage.id}-placeholder-${index + 1}`}
                          type="button"
                          className="quick-placeholder"
                          onClick={() => openCreateDeal(stage.id)}
                        >
                          +
                        </button>
                      ))
                    : null}
                </div>
              )}
            </article>
          ))}
        </section>
      ) : null}

      <Modal open={dealModalOpen} onClose={() => setDealModalOpen(false)} title="ثبت فرصت فروش" size="lg">
        <form className="form-grid" onSubmit={submitDeal}>
          <label>
            <span>عنوان فرصت</span>
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
              required
            >
              <option value="">انتخاب مشتری</option>
              {(contactsQuery.data?.items || []).map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name} - {contact.phone}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>ارزش معامله</span>
            <input
              type="number"
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
            />
          </label>

          <label>
            <span>وضعیت</span>
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="open">باز</option>
              <option value="won">موفق</option>
              <option value="lost">ناموفق</option>
            </select>
          </label>

          <label>
            <span>مرحله</span>
            <select
              value={form.stage_id}
              onChange={(event) => setForm((prev) => ({ ...prev, stage_id: event.target.value }))}
            >
              <option value="">مرحله پیش‌فرض</option>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {localizePipelineStage(stage.name)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>تاریخ پیش‌بینی بستن</span>
            <input
              type="datetime-local"
              value={form.expected_close_at}
              onChange={(event) => setForm((prev) => ({ ...prev, expected_close_at: event.target.value }))}
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={createDealMutation.isPending}>
            {createDealMutation.isPending ? 'در حال ثبت...' : 'ثبت فرصت'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
