// این فایل تمام مسیرهای اصلی برنامه را تعریف می‌کند.

import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import ActivitiesPage from '../pages/activities/ActivitiesPage';
import AdminPage from '../pages/admin/AdminPage';
import ClientProfilePage from '../pages/clients/ClientProfilePage';
import ClientsPage from '../pages/clients/ClientsPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import NotFoundPage from '../pages/not-found/NotFoundPage';
import ProjectsPage from '../pages/projects/ProjectsPage';

/**
 * وظیفه کامپوننت: تبدیل مسیر URL به صفحه مربوطه.
 * ورودی‌ها: ندارد.
 * رفتار: مسیر ریشه را به /dashboard هدایت می‌کند.
 */
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/:clientId" element={<ClientProfilePage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
