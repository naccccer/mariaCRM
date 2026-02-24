// این مودال برای ثبت سریع سرنخ/مشتری جدید استفاده می‌شود.

import Modal from '../../components/common/Modal';

/**
 * وظیفه کامپوننت: فرم ثبت سرنخ جدید در سطح کل برنامه.
 * ورودی‌ها: isOpen, onClose.
 * رفتار: فرم فقط نمایشی است و فعلاً داده‌ای ارسال نمی‌کند.
 */
export default function AddLeadModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ثبت مشتری / سرنخ جدید">
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          onClose();
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
                <select className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:bg-white focus:outline-none focus:border-[#c9a656]">
                  <option>ویلا برج سولاریس</option>
                  <option>برج مسکونی کادنس</option>
                  <option>برج ساحلی ژوان</option>
                  <option>پروژه بلوما</option>
                  <option>برج آفرینش</option>
                  <option>مجتمع یاقوت مصلی</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-bold text-gray-600 mb-1">بودجه حدودی</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:bg-white focus:outline-none focus:border-[#c9a656]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t mt-4">
          <button type="submit" className="flex-1 bg-[#006039] text-white py-2 rounded-lg text-sm font-bold shadow-sm">
            ذخیره مشتری
          </button>
        </div>
      </form>
    </Modal>
  );
}
