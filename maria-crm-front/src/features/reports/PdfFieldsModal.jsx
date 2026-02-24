// این مودال برای انتخاب ستون‌های خروجی PDF در صفحه مشتریان است.

import { FileText } from 'lucide-react';
import Modal from '../../components/common/Modal';

/**
 * وظیفه کامپوننت: نمایش تنظیمات گزارش PDF.
 * ورودی‌ها: isOpen, onClose, fields, selectedFieldIds, onToggleField, onGenerate.
 * رفتار: فیلدهای انتخاب‌شده را کنترل می‌کند و خروجی PDF را با همان ستون‌ها می‌سازد.
 */
export default function PdfFieldsModal({
  isOpen,
  onClose,
  fields,
  selectedFieldIds,
  onToggleField,
  onGenerate,
}) {
  const hasSelectedField = selectedFieldIds.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="انتخاب فیلدهای گزارش PDF" maxWidth="max-w-3xl">
      <div className="space-y-6">
        <p className="text-sm text-gray-500">فیلدهایی که مایلید در فایل PDF چاپ شوند را انتخاب کنید.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
          {fields.map((field) => (
            <label key={field.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFieldIds.includes(field.id)}
                onChange={() => onToggleField(field.id)}
                className="checkbox-custom"
              />
              <span className="text-sm font-bold text-gray-700">{field.label}</span>
            </label>
          ))}
        </div>

        {!hasSelectedField && (
          <p className="text-xs text-rose-600 font-bold text-center">حداقل یک فیلد برای ساخت گزارش PDF انتخاب کنید.</p>
        )}

        <div className="flex justify-center pt-2">
          <button
            onClick={onGenerate}
            disabled={!hasSelectedField}
            className="bg-rose-600 disabled:bg-rose-300 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-lg text-sm font-bold hover:bg-rose-700 flex items-center gap-2"
          >
            <FileText size={18} /> ایجاد و دانلود گزارش
          </button>
        </div>
      </div>
    </Modal>
  );
}
