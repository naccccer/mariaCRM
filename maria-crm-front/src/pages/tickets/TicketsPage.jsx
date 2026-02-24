import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function TicketsPage() {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState('');

  const ticketsQuery = useQuery({
    queryKey: ['tickets'],
    queryFn: () => apiClient.get('/tickets'),
  });

  const createTicketMutation = useMutation({
    mutationFn: (payload) => apiClient.post('/tickets', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setSubject('');
    },
  });

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
        <form
          className="flex gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            createTicketMutation.mutate({ subject, priority: 'normal' });
          }}
        >
          <input
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm"
            placeholder="موضوع تیکت"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-4 rounded-lg text-sm font-bold" disabled={createTicketMutation.isPending}>
            ثبت تیکت
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">موضوع</th>
              <th className="px-4 py-3">مشتری</th>
              <th className="px-4 py-3">وضعیت</th>
              <th className="px-4 py-3">اولویت</th>
            </tr>
          </thead>
          <tbody>
            {(ticketsQuery.data?.items || []).map((ticket) => (
              <tr key={ticket.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-bold text-gray-800">{ticket.subject}</td>
                <td className="px-4 py-3 text-gray-600">{ticket.contact_name || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{ticket.status}</td>
                <td className="px-4 py-3 text-gray-600">{ticket.priority}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
