// این صفحه جزئیات پرونده یک مشتری را با URL اختصاصی نمایش می‌دهد.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Check, Phone, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../lib/apiClient';
import { formatFaDateTime } from '../../lib/date/faDate';

/**
 * وظیفه کامپوننت: نمایش پروفایل مشتری بر اساس شناسه مسیر.
 * ورودی‌ها: ندارد.
 * رفتار: اگر مشتری پیدا نشود، حالت «یافت نشد» را نشان می‌دهد.
 */
export default function ClientProfilePage() {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const queryClient = useQueryClient();

  const contactQuery = useQuery({
    queryKey: ['contact', clientId],
    queryFn: () => apiClient.get(`/contacts/${clientId}`),
  });

  const timelineQuery = useQuery({
    queryKey: ['contact-timeline', clientId],
    queryFn: () => apiClient.get(`/contacts/${clientId}/timeline`),
  });

  const dealsQuery = useQuery({
    queryKey: ['deals', 'by-contact', clientId],
    queryFn: () => apiClient.get(`/deals?contact_id=${clientId}`),
  });

  const moveStageMutation = useMutation({
    mutationFn: ({ dealId, stageId }) => apiClient.post(`/deals/${dealId}/move-stage`, { stage_id: stageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', 'by-contact', clientId] });
      queryClient.invalidateQueries({ queryKey: ['contact-timeline', clientId] });
    },
  });

  const contact = contactQuery.data?.contact;
  const stages = dealsQuery.data?.stages || [];
  const activeDeal = useMemo(() => (dealsQuery.data?.items || [])[0] || null, [dealsQuery.data?.items]);

  if (contactQuery.isLoading) {
    return <div className="text-sm text-gray-500">در حال دریافت پرونده مشتری...</div>;
  }

  if (!contact) {
    return (
      <div className="bg-white p-12 rounded-xl text-center border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-700">پرونده مشتری پیدا نشد</h3>
        <p className="text-sm text-gray-500 mt-2">شناسه وارد شده معتبر نیست یا داده‌ای برای آن وجود ندارد.</p>
        <button
          onClick={() => navigate('/clients')}
          className="mt-5 bg-[#006039] text-white px-5 py-2 rounded-lg text-sm font-bold"
        >
          بازگشت به لیست مشتریان
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 bg-gray-50 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
          >
            <ArrowRight size={20} />
          </button>

          <div>
            <h2 className="text-xl font-bold text-gray-900">{contact.name}</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span>{contact.type || '-'}</span>
              <span dir="ltr">{contact.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-6">وضعیت پرونده (قیف فروش)</h3>
        {activeDeal ? (
          <div className="flex items-center justify-between relative px-4">
            <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gray-100 z-0" />
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 h-1 bg-[#006039] z-0 transition-all duration-500"
              style={{
                width: `${Math.max(0, ((stages.findIndex((item) => Number(item.id) === Number(activeDeal.stage_id)) + 1) / stages.length) * 100)}%`,
              }}
            />

            {stages.map((stage, index) => {
              const currentIndex = stages.findIndex((item) => Number(item.id) === Number(activeDeal.stage_id));
              const isDone = index < currentIndex;
              const isActive = index <= currentIndex;

              return (
                <div
                  key={stage.id}
                  onClick={() => moveStageMutation.mutate({ dealId: activeDeal.id, stageId: stage.id })}
                  className="relative z-10 flex flex-col items-center gap-2 cursor-pointer group bg-white"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                      isActive ? 'bg-[#006039] border-[#006039] text-white' : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isDone ? <Check size={16} /> : <span className="text-xs font-bold">{index + 1}</span>}
                  </div>
                  <span className={`text-xs font-bold ${isActive ? 'text-[#006039]' : 'text-gray-500'}`}>{stage.name}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-500">برای این مشتری هنوز فرصت فروش ثبت نشده است.</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-[#c9a656] border-b border-gray-100 pb-2 mb-3 flex items-center gap-2">
              <Wallet size={16} /> مالی و نیازسنجی
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 font-bold block">بودجه</label>
                <div className="text-sm font-bold text-gray-900 mt-0.5">{contact.budget || '-'}</div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold block">پروژه هدف</label>
                <div className="text-sm font-bold text-gray-900 mt-0.5">{contact.interest || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-800">تاریخچه فعالیت‌ها</h3>
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
            {(timelineQuery.data?.items || []).map((item, index, arr) => (
              <div key={`${item.item_type}-${item.id}`} className="relative pl-4">
                {index !== arr.length - 1 && <div className="absolute right-[11px] top-6 bottom-[-24px] w-px bg-gray-200" />}

                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 shrink-0 z-10">
                    <Phone size={12} />
                  </div>

                  <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
                    <div className="text-[11px] text-gray-400 mt-1">{formatFaDateTime(item.happened_at)}</div>
                  </div>
                </div>
              </div>
            ))}
            {timelineQuery.isLoading ? <div className="text-sm text-gray-500">در حال دریافت تاریخچه...</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
