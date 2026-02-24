// این صفحه لیست پروژه‌ها و برج‌ها را به‌صورت کارت‌های مدیریتی نمایش می‌دهد.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building, Image as ImageIcon, Key, Layers, MapPin, MoreVertical, Plus, Search, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

/**
 * وظیفه کامپوننت: نمایش پروژه‌ها/برج‌ها در کارت‌های خلاصه.
 * ورودی‌ها: ندارد.
 * رفتار: پروژه‌ها را از API می‌خواند و امکان تعریف پروژه جدید می‌دهد.
 */
export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const projectsQuery = useQuery({
    queryKey: ['projects', { search }],
    queryFn: () => apiClient.get(`/projects${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  });

  const createProjectMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/projects', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  const projects = useMemo(() => projectsQuery.data?.items || [], [projectsQuery.data?.items]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-80">
          <div className="relative w-full">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در برج‌ها و پروژه‌ها..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pr-9 pl-4 py-2 text-sm focus:border-[#006039] focus:outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <button
          onClick={() => {
            const name = window.prompt('نام پروژه جدید را وارد کنید');
            if (!name) {
              return;
            }

            createProjectMutation.mutate({ name, status: 'planning' });
          }}
          className="flex items-center justify-center gap-2 bg-[#006039] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#004d2e] transition-colors shadow-sm w-full sm:w-auto"
        >
          <Plus size={16} /> تعریف پروژه جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
          >
            <div className="h-32 bg-gradient-to-br from-emerald-800 to-emerald-600 relative p-5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold backdrop-blur-md bg-white/20 text-white border border-white/30">
                  {project.status}
                </span>
                <button className="text-white/70 hover:text-white transition-colors bg-black/10 hover:bg-black/30 p-1.5 rounded-lg backdrop-blur-sm">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div>
                <h3 className="text-xl font-black text-white drop-shadow-sm">{project.name}</h3>
                <p className="text-white/80 text-xs font-medium mt-1 flex items-center gap-1.5">
                  <MapPin size={12} /> {project.location || '-'}
                </p>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <Layers size={14} />
                    <span className="text-[10px] font-bold">نوع کاربری</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900">{project.type || '-'}</div>
                </div>

                <div className="bg-[#fefce8]/50 rounded-lg p-3 border border-[#c9a656]/20">
                  <div className="flex items-center gap-1.5 text-[#c9a656] mb-1">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-bold">قیمت پایه</span>
                  </div>
                  <div className="text-xs font-bold text-[#c9a656]">{project.base_price || '-'}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[11px] font-bold text-gray-600">پیشرفت فیزیکی پروژه</span>
                  <span className="text-xs font-black text-[#006039]" dir="ltr">
                    {project.progress}%
                  </span>
                </div>

                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#006039] rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }} />
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Key size={16} className="text-gray-400" />
                    <span className="text-[11px] font-bold text-gray-500">موجودی واحدها:</span>
                  </div>

                  <div className="text-sm font-black text-gray-900">
                    <span className="text-emerald-600">{project.available_units}</span>
                    <span className="text-gray-400 text-[10px] mx-1">از</span>
                    {project.total_units}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button className="w-full bg-gray-50 hover:bg-[#006039] hover:text-white text-gray-700 border border-gray-200 hover:border-[#006039] py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex justify-center items-center gap-1.5">
                  <Building size={14} /> مدیریت واحدها
                </button>
                <button className="w-full bg-white hover:bg-gray-50 text-[#c9a656] border border-[#c9a656]/50 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex justify-center items-center gap-1.5">
                  <ImageIcon size={14} /> گالری و بروشور
                </button>
              </div>
            </div>
          </div>
        ))}
        {!projectsQuery.isLoading && projects.length === 0 ? (
          <div className="col-span-full bg-white border border-gray-100 rounded-xl p-8 text-center text-sm text-gray-500">پروژه‌ای یافت نشد.</div>
        ) : null}
      </div>
    </div>
  );
}
