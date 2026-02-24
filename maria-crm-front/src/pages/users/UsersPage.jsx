import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role_ids: [] });

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: () => apiClient.get('/users') });

  const createMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/users', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setForm({ full_name: '', email: '', password: '', role_ids: [] });
    },
  });

  const roleOptions = useMemo(() => usersQuery.data?.roles || [], [usersQuery.data?.roles]);

  return (
    <div className="space-y-4">
      <section className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
        <h2 className="text-sm font-bold text-gray-800 mb-3">ایجاد کاربر جدید</h2>
        <form
          className="grid grid-cols-1 md:grid-cols-4 gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate(form);
          }}
        >
          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="نام کامل"
            value={form.full_name}
            onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))}
            required
          />
          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="ایمیل"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
          <input
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            placeholder="رمز عبور"
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={form.role_ids[0] || ''}
            onChange={(event) => setForm((prev) => ({ ...prev, role_ids: event.target.value ? [Number(event.target.value)] : [] }))}
          >
            <option value="">انتخاب نقش</option>
            {roleOptions.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <button type="submit" className="md:col-span-4 bg-[#006039] text-white rounded-lg py-2.5 text-sm font-bold">
            ایجاد کاربر
          </button>
        </form>
      </section>

      <section className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">نام</th>
              <th className="px-4 py-3">ایمیل</th>
              <th className="px-4 py-3">نقش‌ها</th>
              <th className="px-4 py-3">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {(usersQuery.data?.users || []).map((user) => (
              <tr key={user.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-bold text-gray-800">{user.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-gray-600">{(user.role_codes || []).join('، ') || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{user.is_active ? 'فعال' : 'غیرفعال'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
