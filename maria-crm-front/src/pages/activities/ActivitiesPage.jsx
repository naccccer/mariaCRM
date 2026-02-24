// این صفحه وضعیت فعالیت‌های جاری را نمایش می‌دهد و امکان ثبت فعالیت جدید دارد.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import FollowUpModal from '../../features/activities/FollowUpModal';
import { apiClient } from '../../lib/apiClient';
import { formatFaDateTime, toIsoDateTime } from '../../lib/date/faDate';

/**
 * وظیفه کامپوننت: نمایش داشبورد فعالیت‌ها و جدول پیگیری‌ها.
 * ورودی‌ها: ندارد.
 * رفتار: مودال ثبت فعالیت را داخل همین صفحه کنترل می‌کند.
 */
export default function ActivitiesPage() {
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const contactsQuery = useQuery({
    queryKey: ['contacts', 'for-activities'],
    queryFn: () => apiClient.get('/contacts'),
  });

  const activitiesQuery = useQuery({
    queryKey: ['activities'],
    queryFn: () => apiClient.get('/activities'),
  });

  const createActivityMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/activities', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setIsFollowUpModalOpen(false);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (activityId) => apiClient.post(`/activities/${activityId}/complete`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });

  const clientMap = useMemo(() => {
    const map = new Map();
    (contactsQuery.data?.items || []).forEach((contact) => {
      map.set(contact.name, contact.id);
    });
    return map;
  }, [contactsQuery.data?.items]);

  const activities = useMemo(() => {
    const items = activitiesQuery.data?.items || [];
    if (!search.trim()) {
      return items;
    }

    const normalizedSearch = search.trim();
    return items.filter(
      (item) =>
        item.client?.includes(normalizedSearch) ||
        item.title?.includes(normalizedSearch) ||
        item.description?.includes(normalizedSearch),
    );
  }, [activitiesQuery.data?.items, search]);

  const totals = {
    total: activities.length,
    inProgress: activities.filter((item) => item.status === 'todo').length,
    done: activities.filter((item) => item.status === 'done').length,
    overdue: activities.filter((item) => item.status !== 'done' && item.due_at && new Date(item.due_at) < new Date()).length,
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="کل فعالیت‌ها" value={totals.total} className="bg-blue-50/80 border-blue-100 text-blue-900" />
          <StatCard title="در حال انجام" value={totals.inProgress} className="bg-amber-50/80 border-amber-100 text-amber-900" />
          <StatCard title="انجام شده" value={totals.done} className="bg-emerald-50/80 border-emerald-100 text-emerald-900" />
          <StatCard title="سررسید گذشته" value={totals.overdue} className="bg-rose-50/80 border-rose-100 text-rose-900" />
        </div>

        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 w-64">
            <div className="relative w-full">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجوی فعالیت..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pr-9 pl-4 py-2 text-sm focus:border-[#006039] focus:outline-none"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <button
            onClick={() => setIsFollowUpModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} /> ثبت فعالیت جدید
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-800 text-white text-xs uppercase tracking-wider">
                  <th className="px-5 py-3.5 font-bold rounded-tr-lg">مشتری</th>
                  <th className="px-5 py-3.5 font-bold">عنوان</th>
                  <th className="px-5 py-3.5 font-bold text-center">سررسید</th>
                  <th className="px-5 py-3.5 font-bold text-center">وضعیت</th>
                  <th className="px-5 py-3.5 font-bold text-center rounded-tl-lg">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900">{activity.client || '-'}</td>
                    <td className="px-5 py-4 font-medium text-gray-800">{activity.title}</td>
                    <td className="px-5 py-4 text-center font-bold text-gray-600">{formatFaDateTime(activity.due_at)}</td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${
                          activity.status === 'done'
                            ? 'bg-emerald-50 text-emerald-700'
                            : activity.due_at && new Date(activity.due_at) < new Date()
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {activity.status === 'done'
                          ? 'انجام شده'
                          : activity.due_at && new Date(activity.due_at) < new Date()
                            ? 'سررسید گذشته'
                            : 'در حال انجام'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => completeMutation.mutate(activity.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors text-xs font-bold disabled:opacity-60"
                        disabled={activity.status === 'done' || completeMutation.isPending}
                      >
                        تکمیل
                      </button>
                    </td>
                  </tr>
                ))}
                {activitiesQuery.isLoading ? (
                  <tr>
                    <td className="px-5 py-8 text-sm text-gray-500 text-center" colSpan={5}>
                      در حال دریافت فعالیت‌ها...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        clientOptions={(contactsQuery.data?.items || []).map((client) => client.name)}
        onSubmit={(values) => {
          const contactId = clientMap.get(values.clientName) || null;

          createActivityMutation.mutate({
            contact_id: contactId,
            title: values.title,
            description: values.description,
            due_at: toIsoDateTime(values.due_at),
            status: values.tab === 'فعالیت‌ها' ? 'done' : 'todo',
            type: values.type,
          });
        }}
        submitting={createActivityMutation.isPending}
      />
    </>
  );
}

function StatCard({ title, value, className }) {
  return (
    <div className={`${className} border p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm`}>
      <h3 className="text-sm font-bold mb-1">{title}</h3>
      <span className="text-3xl font-black" style={{ fontFamily: 'sans-serif' }}>
        {value}
      </span>
    </div>
  );
}
