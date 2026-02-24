// این کامپوننت پایه‌ی تمام مودال‌های برنامه است.

import { X } from 'lucide-react';

/**
 * وظیفه کامپوننت: نمایش یک مودال عمومی با عنوان و محتوای سفارشی.
 * ورودی‌ها: isOpen, onClose, title, children, maxWidth.
 * رفتار: وقتی isOpen=false باشد هیچ DOMی رندر نمی‌کند.
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-4xl' }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-2 sm:p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} mx-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] overflow-hidden border border-gray-100`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}
