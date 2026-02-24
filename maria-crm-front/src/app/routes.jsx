// این فایل تمام مسیرهای اصلی برنامه را تعریف می‌کند.

import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/routing/ProtectedRoute';
import LoginPage from '../pages/auth/LoginPage';
import AppLayout from '../layouts/AppLayout';
import ActivitiesPage from '../pages/activities/ActivitiesPage';
import AdminPage from '../pages/admin/AdminPage';
import ClientProfilePage from '../pages/clients/ClientProfilePage';
import ClientsPage from '../pages/clients/ClientsPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import DealsPage from '../pages/deals/DealsPage';
import NotFoundPage from '../pages/not-found/NotFoundPage';
import ProjectsPage from '../pages/projects/ProjectsPage';
import ReportsPage from '../pages/reports/ReportsPage';
import TicketsPage from '../pages/tickets/TicketsPage';
import UsersPage from '../pages/users/UsersPage';

/**
 * وظیفه کامپوننت: تبدیل مسیر URL به صفحه مربوطه.
 * ورودی‌ها: ندارد.
 * رفتار: مسیر ریشه را به /dashboard هدایت می‌کند.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/:clientId" element={<ClientProfilePage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route
          path="/users"
          element={
            <ProtectedRoute permission="users.manage">
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
