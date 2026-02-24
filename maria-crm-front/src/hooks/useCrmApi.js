import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export const crmKeys = {
  contacts: ['contacts'],
  leads: ['leads'],
  contact: (contactId) => ['contact', contactId],
  timelines: ['timeline'],
  timeline: (contactId) => ['timeline', contactId],
  deals: ['deals'],
  activities: ['activities'],
  tickets: ['tickets'],
  reportsKpi: ['reports', 'kpi'],
  reportsPipeline: ['reports', 'pipeline'],
  reportsUsers: ['reports', 'users'],
  users: ['users'],
};

function invalidateList(queryClient, key) {
  queryClient.invalidateQueries({ queryKey: key });
}

export function useContacts(filters, options = {}) {
  return useQuery({
    queryKey: [...crmKeys.contacts, filters],
    queryFn: () => apiClient.get('/contacts', filters),
    ...options,
  });
}

export function useContact(contactId, options = {}) {
  return useQuery({
    queryKey: crmKeys.contact(contactId),
    queryFn: () => apiClient.get(`/contacts/${contactId}`),
    enabled: Boolean(contactId),
    ...options,
  });
}

export function useContactTimeline(contactId, options = {}) {
  return useQuery({
    queryKey: crmKeys.timeline(contactId),
    queryFn: () => apiClient.get(`/contacts/${contactId}/timeline`),
    enabled: Boolean(contactId),
    ...options,
  });
}

export function useLeads(filters, options = {}) {
  return useQuery({
    queryKey: [...crmKeys.leads, filters],
    queryFn: () => apiClient.get('/leads', filters),
    ...options,
  });
}

export function useDeals(filters, options = {}) {
  return useQuery({
    queryKey: [...crmKeys.deals, filters],
    queryFn: () => apiClient.get('/deals', filters),
    ...options,
  });
}

export function useActivities(filters, options = {}) {
  return useQuery({
    queryKey: [...crmKeys.activities, filters],
    queryFn: () => apiClient.get('/activities', filters),
    ...options,
  });
}

export function useTickets(filters, options = {}) {
  return useQuery({
    queryKey: [...crmKeys.tickets, filters],
    queryFn: () => apiClient.get('/tickets', filters),
    ...options,
  });
}

export function useReportsKpi(options = {}) {
  return useQuery({
    queryKey: crmKeys.reportsKpi,
    queryFn: () => apiClient.get('/reports/kpi'),
    ...options,
  });
}

export function useReportsPipeline(options = {}) {
  return useQuery({
    queryKey: crmKeys.reportsPipeline,
    queryFn: () => apiClient.get('/reports/pipeline'),
    ...options,
  });
}

export function useReportsUsers(options = {}) {
  return useQuery({
    queryKey: crmKeys.reportsUsers,
    queryFn: () => apiClient.get('/reports/users'),
    ...options,
  });
}

export function useUsers(options = {}) {
  return useQuery({
    queryKey: crmKeys.users,
    queryFn: () => apiClient.get('/users'),
    ...options,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiClient.post('/contacts', payload),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.contacts);
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiClient.post('/leads', payload),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.leads);
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => apiClient.patch(`/leads/${id}`, payload),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.leads);
    },
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leadId) => apiClient.post(`/leads/${leadId}/convert`, {}),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.leads);
      invalidateList(queryClient, crmKeys.contacts);
      invalidateList(queryClient, crmKeys.deals);
    },
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiClient.post('/deals', payload),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.deals);
      invalidateList(queryClient, crmKeys.contacts);
    },
  });
}

export function useMoveDealStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage_id }) => apiClient.post(`/deals/${id}/move-stage`, { stage_id }),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.deals);
      invalidateList(queryClient, crmKeys.timelines);
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiClient.post('/activities', payload),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.activities);
      invalidateList(queryClient, crmKeys.timelines);
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => apiClient.patch(`/activities/${id}`, payload),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.activities);
    },
  });
}

export function useCompleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => apiClient.post(`/activities/${id}/complete`, {}),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.activities);
    },
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiClient.post('/tickets', payload),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.tickets);
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => apiClient.patch(`/tickets/${id}`, payload),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.tickets);
    },
  });
}

export function useAddTicketComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => apiClient.post(`/tickets/${id}/comments`, payload),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.tickets);
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => apiClient.post('/users', payload),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.users);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => apiClient.patch(`/users/${id}`, payload),
    onSuccess: () => {
      invalidateList(queryClient, crmKeys.users);
    },
  });
}
