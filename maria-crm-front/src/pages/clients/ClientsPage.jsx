// این صفحه لیست مشتریان/سرنخ‌ها را نمایش می‌دهد و مودال‌های مخصوص همین صفحه را مدیریت می‌کند.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Eye, FileDown, FileText, Filter, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FollowUpModal from '../../features/activities/FollowUpModal';
import { exportClientsToExcel, exportClientsToPdf } from '../../features/reports/exportClients';
import PdfFieldsModal from '../../features/reports/PdfFieldsModal';
import { CLIENT_REPORT_FIELDS, DEFAULT_CLIENT_REPORT_FIELD_IDS } from '../../features/reports/reportFields';
import { apiClient } from '../../lib/apiClient';
import { toIsoDateTime } from '../../lib/date/faDate';

/**
 * وظیفه کامپوننت: نمایش جدول مشتریان و اکشن‌های وابسته.
 * ورودی‌ها: ندارد.
 * رفتار: پرونده هر مشتری را با route جداگانه باز می‌کند و خروجی Excel/PDF واقعی می‌سازد.
 */
export default function ClientsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedPdfFieldIds, setSelectedPdfFieldIds] = useState(DEFAULT_CLIENT_REPORT_FIELD_IDS);

  const contactsQuery = useQuery({
    queryKey: ['contacts', { search }],
    queryFn: () => apiClient.get(`/contacts${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  });

  const createActivityMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/activities', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      setIsFollowUpModalOpen(false);
      setSelectedClientName('');
      setSelectedClientId(null);
    },
  });

  const clients = useMemo(() => contactsQuery.data?.items || [], [contactsQuery.data?.items]);

  const handleExcelExport = () => {
    exportClientsToExcel(clients);
  };

  const handlePdfFieldToggle = (fieldId) => {
    setSelectedPdfFieldIds((previousFieldIds) => {
      if (previousFieldIds.includes(fieldId)) {
        return previousFieldIds.filter((id) => id !== fieldId);
      }

      return [...previousFieldIds, fieldId];
    });
  };

  const handlePdfExport = async () => {
    try {
      await exportClientsToPdf(clients, selectedPdfFieldIds);
      setIsPdfModalOpen(false);
    } catch (error) {
      console.error(error);
      window.alert('ایجاد گزارش PDF با خطا مواجه شد. لطفا دوباره تلاش کنید.');
    }
  };

  return (
    <>
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو مشتری..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pr-9 pl-4 py-2 text-sm focus:border-[#006039] focus:outline-none"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100">
              <Filter size={16} /> فیلتر
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleExcelExport}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-100"
            >
              <FileDown size={16} /> خروجی اکسل
            </button>

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-100"
            >
              <FileText size={16} /> گزارش PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-right border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="px-5 py-4 font-bold">نام و شماره</th>
                  <th className="px-5 py-4 font-bold">توان مالی / بودجه</th>
                  <th className="px-5 py-4 font-bold">پروژه هدف</th>
                  <th className="px-5 py-4 font-bold text-center">وضعیت</th>
                  <th className="px-5 py-4 font-bold text-center">عملیات (CRM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#f0fdf4]/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-gray-900">{client.name}</div>
                      <div className="text-gray-500 text-[11px] mt-0.5" dir="ltr">
                        {client.phone}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="text-[#006039] font-bold text-xs" dir="rtl">
                        {client.budget || '-'}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-gray-600 font-medium text-xs">{client.interest || '-'}</td>

                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-block px-3 py-1 rounded-md text-[11px] font-bold border bg-gray-100 text-gray-600">
                        {client.status || '-'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="flex items-center gap-1 bg-gray-100 hover:bg-[#c9a656] hover:text-white text-gray-600 px-3 py-1.5 rounded-md transition-colors text-xs font-bold"
                        >
                          <Eye size={14} /> پرونده
                        </button>

                        <button
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setSelectedClientName(client.name);
                            setIsFollowUpModalOpen(true);
                          }}
                          className="flex items-center gap-1 bg-gray-100 hover:bg-[#006039] hover:text-white text-gray-600 px-3 py-1.5 rounded-md transition-colors text-xs font-bold"
                        >
                          <Clock size={14} /> پیگیری
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {contactsQuery.isLoading ? (
                  <tr>
                    <td className="px-5 py-10 text-sm text-gray-500 text-center" colSpan={5}>
                      در حال دریافت مشتریان...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <PdfFieldsModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        fields={CLIENT_REPORT_FIELDS}
        selectedFieldIds={selectedPdfFieldIds}
        onToggleField={handlePdfFieldToggle}
        onGenerate={handlePdfExport}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => {
          setIsFollowUpModalOpen(false);
          setSelectedClientName('');
          setSelectedClientId(null);
        }}
        initialClientName={selectedClientName}
        lockClient
        onSubmit={(values) =>
          createActivityMutation.mutate({
            contact_id: selectedClientId,
            title: values.title,
            description: values.description,
            type: values.type,
            due_at: toIsoDateTime(values.due_at),
            status: values.tab === 'فعالیت‌ها' ? 'done' : 'todo',
          })
        }
        submitting={createActivityMutation.isPending}
      />
    </>
  );
}
