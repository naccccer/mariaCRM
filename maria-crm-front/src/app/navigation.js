import {
  BarChart3,
  ContactRound,
  Gauge,
  Kanban,
  Ticket,
  UserCog,
  Users,
} from 'lucide-react';

export const navigationItems = [
  { to: '/dashboard', label: 'داشبورد', icon: Gauge },
  { to: '/crm', label: 'مشتریان و سرنخ ها', icon: Users },
  { to: '/deals', label: 'قیف فروش', icon: Kanban, permission: 'deals.read' },
  { to: '/activities', label: 'فعالیت ها', icon: ContactRound, permission: 'activities.read' },
  { to: '/tickets', label: 'تیکت ها', icon: Ticket, permission: 'tickets.read' },
  { to: '/reports', label: 'گزارش ها', icon: BarChart3, permission: 'reports.read' },
  { to: '/users', label: 'کاربران و نقش ها', icon: UserCog, permission: 'users.manage' },
];
