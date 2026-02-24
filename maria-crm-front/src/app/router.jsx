import { Navigate, Route, Routes } from 'react-router-dom';
import AuthGuard from '../components/guards/AuthGuard';
import PermissionGuard from '../components/guards/PermissionGuard';
import AppShell from '../components/layout/AppShell';
import ActivitiesPage from '../pages/activities/ActivitiesPage';
import LoginPage from '../pages/auth/LoginPage';
import ContactProfilePage from '../pages/crm/ContactProfilePage';
import ContactsLeadsPage from '../pages/crm/ContactsLeadsPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import DealsPipelinePage from '../pages/deals/DealsPipelinePage';
import NotFoundPage from '../pages/not-found/NotFoundPage';
import ReportsPage from '../pages/reports/ReportsPage';
import TicketsPage from '../pages/tickets/TicketsPage';
import UsersPage from '../pages/users/UsersPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <AuthGuard>
            <AppShell />
          </AuthGuard>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/crm" element={<ContactsLeadsPage />} />
        <Route path="/crm/contacts/:contactId" element={<ContactProfilePage />} />

        <Route
          path="/deals"
          element={
            <PermissionGuard permission="deals.read">
              <DealsPipelinePage />
            </PermissionGuard>
          }
        />

        <Route
          path="/activities"
          element={
            <PermissionGuard permission="activities.read">
              <ActivitiesPage />
            </PermissionGuard>
          }
        />

        <Route
          path="/tickets"
          element={
            <PermissionGuard permission="tickets.read">
              <TicketsPage />
            </PermissionGuard>
          }
        />

        <Route
          path="/reports"
          element={
            <PermissionGuard permission="reports.read">
              <ReportsPage />
            </PermissionGuard>
          }
        />

        <Route
          path="/users"
          element={
            <PermissionGuard permission="users.manage">
              <UsersPage />
            </PermissionGuard>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
