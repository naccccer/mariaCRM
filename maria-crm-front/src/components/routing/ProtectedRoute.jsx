import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

export default function ProtectedRoute({ children, permission }) {
  const { loading, isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">در حال بارگذاری...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div className="bg-white p-10 rounded-xl border border-gray-200 text-center shadow-sm">
        <h2 className="text-lg font-bold text-gray-700">دسترسی غیرمجاز</h2>
        <p className="text-sm text-gray-500 mt-2">برای مشاهده این بخش مجوز لازم را ندارید.</p>
      </div>
    );
  }

  return children;
}
