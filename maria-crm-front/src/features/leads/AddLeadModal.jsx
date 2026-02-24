// این مودال برای ثبت سریع سرنخ/مشتری جدید استفاده می‌شود.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import Modal from '../../components/common/Modal';
import { apiClient } from '../../lib/apiClient';

/**
 * وظیفه کامپوننت: فرم ثبت سرنخ جدید در سطح کل برنامه.
 * ورودی‌ها: isOpen, onClose.
 * رفتار: پس از ذخیره، لیست لیدها را تازه‌سازی می‌کند.
 */
export default function AddLeadModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    interest: '',
    budget: '',
  });

  const projectsQuery = useQuery({
    queryKey: ['projects', 'options'],
    queryFn: () => apiClient.get('/projects'),
    enabled: isOpen,
  });

  const projectOptions = useMemo(() => projectsQuery.data?.items || [], [projectsQuery.data?.items]);

  const createLeadMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/leads', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setForm({ full_name: '', phone: '', interest: '', budget: '' });
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ثبت مشتری / سرنخ جدید">
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          createLeadMutation.mutate({
            full_name: form.full_name,
            phone: form.phone,
            budget: form.budget ? Number(form.budget) : null,
            interest: form.interest || null,
            status: 'new',
          });
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#006039] border-b pb-1">اطلاعات پایه و تماس</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  نام کامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:bg-white focus:outline-none focus:border-[#006039]"
                  value={form.full_name}
                  onChange={(event) => setForm((previous) => ({ ...previous, full_name: event.target.value }))}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  موبایل <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  dir="ltr"
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:bg-white focus:outline-none focus:border-[#006039]"
                  value={form.phone}
                  onChange={(event) => setForm((previous) => ({ ...previous, phone: event.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#c9a656] border-b pb-1">نیازسنجی و مالی</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-600 mb-1">پروژه هدف</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:bg-white focus:outline-none focus:border-[#c9a656]"
                  value={form.interest}
                  onChange={(event) => setForm((previous) => ({ ...previous, interest: event.target.value }))}
                >
                  <option value="">انتخاب پروژه</option>
                  {projectOptions.map((project) => (
                    <option key={project.id} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-600 mb-1">بودجه حدودی</label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:bg-white focus:outline-none focus:border-[#c9a656]"
                  value={form.budget}
                  onChange={(event) => setForm((previous) => ({ ...previous, budget: event.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {createLeadMutation.isError ? (
          <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {createLeadMutation.error?.message || 'ثبت سرنخ ناموفق بود.'}
          </div>
        ) : null}

        <div className="flex gap-3 pt-4 border-t mt-4">
          <button
            type="submit"
            className="flex-1 bg-[#006039] text-white py-2 rounded-lg text-sm font-bold shadow-sm disabled:opacity-70"
            disabled={createLeadMutation.isPending}
          >
            {createLeadMutation.isPending ? 'در حال ذخیره...' : 'ذخیره مشتری'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
