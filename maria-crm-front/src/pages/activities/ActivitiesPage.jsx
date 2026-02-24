// این صفحه وضعیت فعالیت‌های جاری را نمایش می‌دهد و امکان ثبت فعالیت جدید دارد.

import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import FollowUpModal from '../../features/activities/FollowUpModal';
import { ACTIVITIES_DATA } from '../../data/mockData';

/**
 * وظیفه کامپوننت: نمایش داشبورد فعالیت‌ها و جدول پیگیری‌ها.
 * ورودی‌ها: ندارد.
 * رفتار: مودال ثبت فعالیت را داخل همین صفحه کنترل می‌کند.
 */
export default function ActivitiesPage() {
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50/80 border border-blue-100 p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <h3 className="text-blue-800 text-sm font-bold mb-1">کل فعالیت‌ها</h3>
            <span className="text-blue-900 text-3xl font-black" style={{ fontFamily: 'sans-serif' }}>
              ۴
            </span>
          </div>

          <div className="bg-amber-50/80 border border-amber-100 p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <h3 className="text-amber-800 text-sm font-bold mb-1">در حال انجام</h3>
            <span className="text-amber-900 text-3xl font-black" style={{ fontFamily: 'sans-serif' }}>
              ۲
            </span>
          </div>

          <div className="bg-emerald-50/80 border border-emerald-100 p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <h3 className="text-emerald-800 text-sm font-bold mb-1">انجام شده</h3>
            <span className="text-emerald-900 text-3xl font-black" style={{ fontFamily: 'sans-serif' }}>
              ۱
            </span>
          </div>

          <div className="bg-rose-50/80 border border-rose-100 p-5 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
            <h3 className="text-rose-800 text-sm font-bold mb-1">سررسید گذشته</h3>
            <span className="text-rose-900 text-3xl font-black" style={{ fontFamily: 'sans-serif' }}>
              ۱
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 w-64">
            <div className="relative w-full">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجوی فعالیت..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg pr-9 pl-4 py-2 text-sm focus:border-[#006039] focus:outline-none"
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
                {ACTIVITIES_DATA.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900">{activity.client}</td>
                    <td className="px-5 py-4 font-medium text-gray-800">{activity.title}</td>
                    <td className="px-5 py-4 text-center font-bold text-gray-600" dir="ltr">
                      {activity.due}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded text-[11px] font-bold ${
                          activity.status === 'انجام شده'
                            ? 'bg-emerald-50 text-emerald-700'
                            : activity.status === 'سررسید گذشته'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors text-xs font-bold">
                        ویرایش
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <FollowUpModal isOpen={isFollowUpModalOpen} onClose={() => setIsFollowUpModalOpen(false)} />
    </>
  );
}
