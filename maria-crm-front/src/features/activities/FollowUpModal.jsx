// این مودال برای ثبت پیگیری/فعالیت استفاده می‌شود و در چند صفحه قابل استفاده مجدد است.

import { useId, useMemo, useState } from 'react';
import Modal from '../../components/common/Modal';

/**
 * وظیفه کامپوننت: فرم پیگیری مشتری یا فعالیت جدید.
 * ورودی‌ها: isOpen, onClose, initialClientName, clientOptions, lockClient, onSubmit, submitting.
 * رفتار: تب داخلی مودال (کارها/فعالیت‌ها) را محلی نگه می‌دارد.
 */
export default function FollowUpModal({
  isOpen,
  onClose,
  initialClientName = '',
  clientOptions = [],
  lockClient = false,
  onSubmit,
  submitting = false,
}) {
  const [activeTab, setActiveTab] = useState('کارها');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState('');
  const clientDatalistId = useId();

  const uniqueClientOptions = useMemo(
    () => [...new Set(clientOptions.map((name) => name.trim()).filter(Boolean))],
    [clientOptions],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ثبت پیگیری / فعالیت" maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('کارها')}
            className={`px-6 py-2.5 text-sm font-bold border-b-2 ${
              activeTab === 'کارها' ? 'border-[#006039] text-[#006039]' : 'border-transparent text-gray-500'
            }`}
          >
            کارها (آینده)
          </button>

          <button
            onClick={() => setActiveTab('فعالیت‌ها')}
            className={`px-6 py-2.5 text-sm font-bold border-b-2 ${
              activeTab === 'فعالیت‌ها' ? 'border-[#006039] text-[#006039]' : 'border-transparent text-gray-500'
            }`}
          >
            فعالیت‌ها (انجام شده)
          </button>
        </div>

        <form
          className="space-y-4 pt-2"
          onSubmit={(event) => {
            event.preventDefault();

            const formData = new FormData(event.currentTarget);
            onSubmit?.({
              tab: activeTab,
              clientName: lockClient ? initialClientName : String(formData.get('clientName') || ''),
              title,
              description,
              due_at: dueAt || null,
              type: activeTab === 'فعالیت‌ها' ? 'activity' : 'task',
            });
          }}
        >
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">مشتری</label>

            {lockClient ? (
              <input
                type="text"
                value={initialClientName || 'مشتری انتخاب نشده'}
                readOnly
                className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-700"
              />
            ) : uniqueClientOptions.length > 0 ? (
              <>
                <input
                  type="text"
                  name="clientName"
                  list={clientDatalistId}
                  defaultValue={initialClientName}
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#006039]"
                  placeholder="جستجو و انتخاب مشتری"
                  required
                />

                <datalist id={clientDatalistId}>
                  {uniqueClientOptions.map((clientName) => (
                    <option key={clientName} value={clientName} />
                  ))}
                </datalist>
              </>
            ) : (
              <input
                type="text"
                name="clientName"
                defaultValue={initialClientName}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#006039]"
                placeholder="نام مشتری"
                required
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">عنوان / نوع</label>
            <input
              type="text"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#006039]"
              placeholder="تماس، جلسه..."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">توضیحات</label>
            <textarea
              rows="3"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#006039] resize-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">موعد</label>
            <input
              type="datetime-local"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#006039]"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-[#006039] text-white px-6 py-2.5 rounded-lg text-sm font-bold disabled:opacity-70"
              disabled={submitting}
            >
              {submitting ? 'در حال ثبت...' : 'ثبت نهایی'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
