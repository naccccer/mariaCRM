import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function DealsPage() {
  const queryClient = useQueryClient();
  const [newDeal, setNewDeal] = useState({ title: '', contact_id: '', amount: '' });

  const dealsQuery = useQuery({
    queryKey: ['deals'],
    queryFn: () => apiClient.get('/deals'),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/deals', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      setNewDeal({ title: '', contact_id: '', amount: '' });
    },
  });

  const grouped = useMemo(() => {
    const data = dealsQuery.data;
    if (!data) {
      return [];
    }

    return data.stages.map((stage) => ({
      stage,
      deals: data.items.filter((deal) => Number(deal.stage_id) === Number(stage.id)),
    }));
  }, [dealsQuery.data]);

  if (dealsQuery.isLoading) {
    return <div className="text-sm text-gray-500">در حال بارگذاری فرصت‌ها...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-sm font-bold text-gray-800 mb-3">ثبت فرصت جدید</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate({
              title: newDeal.title,
              contact_id: Number(newDeal.contact_id),
              amount: Number(newDeal.amount || 0),
            });
          }}
        >
          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="عنوان فرصت"
            value={newDeal.title}
            onChange={(event) => setNewDeal((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="شناسه مشتری"
            value={newDeal.contact_id}
            onChange={(event) => setNewDeal((prev) => ({ ...prev, contact_id: event.target.value }))}
            required
          />
          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="مبلغ"
            value={newDeal.amount}
            onChange={(event) => setNewDeal((prev) => ({ ...prev, amount: event.target.value }))}
          />
          <button type="submit" className="bg-[#006039] text-white rounded-lg text-sm font-bold" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'در حال ثبت...' : 'ثبت'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {grouped.map(({ stage, deals }) => (
          <section key={stage.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3">
            <header className="pb-2 border-b border-gray-100 mb-3 flex justify-between items-center">
              <h3 className="font-bold text-sm text-gray-800">{stage.name}</h3>
              <span className="text-xs text-gray-500">{deals.length}</span>
            </header>

            <div className="space-y-2">
              {deals.map((deal) => (
                <div key={deal.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="text-sm font-bold text-gray-800">{deal.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{deal.contact_name}</div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
