// این صفحه جزئیات پرونده یک مشتری را با URL اختصاصی نمایش می‌دهد.

import { ArrowRight, Check, Phone, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CLIENT_HISTORY, EXTENDED_CLIENTS } from '../../data/mockData';

const PIPELINE_STEPS = ['سرنخ جدید', 'مذاکره اولیه', 'بازدید / جلسه', 'پیش‌نویس قرارداد', 'موفق'];

/**
 * وظیفه کامپوننت: نمایش پروفایل مشتری بر اساس شناسه مسیر.
 * ورودی‌ها: ندارد.
 * رفتار: اگر مشتری پیدا نشود، حالت «یافت نشد» را نشان می‌دهد.
 */
export default function ClientProfilePage() {
  const navigate = useNavigate();
  const { clientId } = useParams();

  const client = useMemo(
    () => EXTENDED_CLIENTS.find((item) => item.id === Number(clientId)),
    [clientId],
  );

  const [pipelineStep, setPipelineStep] = useState(client?.pipeline ?? 0);

  if (!client) {
    return (
      <div className="bg-white p-12 rounded-xl text-center border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-700">پرونده مشتری پیدا نشد</h3>
        <p className="text-sm text-gray-500 mt-2">شناسه وارد شده معتبر نیست یا داده نمونه برای آن وجود ندارد.</p>
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
            <h2 className="text-xl font-bold text-gray-900">{client.name}</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span>{client.type}</span>
              <span dir="ltr">{client.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-6">وضعیت پرونده (قیف فروش)</h3>
        <div className="flex items-center justify-between relative px-4">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-gray-100 z-0" />

          {/* عرض نوار سبز با توجه به مرحله انتخابی محاسبه می‌شود. */}
          <div
            className="absolute right-4 top-1/2 -translate-y-1/2 h-1 bg-[#006039] z-0 transition-all duration-500"
            style={{ width: `${(pipelineStep / (PIPELINE_STEPS.length - 1)) * 100}%` }}
          />

          {PIPELINE_STEPS.map((step, index) => (
            <div
              key={step}
              onClick={() => setPipelineStep(index)}
              className="relative z-10 flex flex-col items-center gap-2 cursor-pointer group bg-white"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  index <= pipelineStep
                    ? 'bg-[#006039] border-[#006039] text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {index < pipelineStep ? <Check size={16} /> : <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <span className={`text-xs font-bold ${index <= pipelineStep ? 'text-[#006039]' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
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
                <div className="text-sm font-bold text-gray-900 mt-0.5">{client.budget}</div>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold block">پروژه هدف</label>
                <div className="text-sm font-bold text-gray-900 mt-0.5">{client.interest}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-800">تاریخچه فعالیت‌ها</h3>
          </div>

          <div className="p-5 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
            {CLIENT_HISTORY.map((item, index) => (
              <div key={item.id} className="relative pl-4">
                {index !== CLIENT_HISTORY.length - 1 && (
                  <div className="absolute right-[11px] top-6 bottom-[-24px] w-px bg-gray-200" />
                )}

                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 shrink-0 z-10">
                    <Phone size={12} />
                  </div>

                  <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
