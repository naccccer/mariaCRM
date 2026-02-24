import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';

export default function PermissionGuard({ permission, children }) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return (
      <section className="state-card">
        <ShieldAlert size={24} />
        <h2>دسترسی غیرمجاز</h2>
        <p>برای مشاهده این بخش باید مجوز لازم را داشته باشید.</p>
      </section>
    );
  }

  return children;
}
