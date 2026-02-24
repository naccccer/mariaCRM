import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { LoadingState } from '../ui/Feedback';

export default function AuthGuard({ children }) {
  const location = useLocation();
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingState message="در حال بررسی نشست کاربری..." fullPage />;
  }

  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return children;
}
