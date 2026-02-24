// این مودال برای ثبت پیگیری/فعالیت استفاده می‌شود و در چند صفحه قابل استفاده مجدد است.

import { useState } from 'react';
import Modal from '../../components/common/Modal';

/**
 * وظیفه کامپوننت: فرم پیگیری مشتری یا فعالیت جدید.
 * ورودی‌ها: isOpen, onClose.
 * رفتار: تب داخلی مودال (کارها/فعالیت‌ها) را محلی نگه می‌دارد.
 */
export default function FollowUpModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('کارها');

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
            onClose();
          }}
        >
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">عنوان / نوع</label>
            <input
              type="text"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#006039]"
              placeholder="تماس، جلسه..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">توضیحات</label>
            <textarea
              rows="3"
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#006039] resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="bg-[#006039] text-white px-6 py-2.5 rounded-lg text-sm font-bold">
              ثبت نهایی
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
