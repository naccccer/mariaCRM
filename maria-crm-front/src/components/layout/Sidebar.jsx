import { Link, NavLink } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { navigationItems } from '../../app/navigation';
import { useAuth } from '../../features/auth/useAuth';

export default function Sidebar({ open, onClose }) {
  const { hasPermission, user, logout } = useAuth();

  const visibleItems = navigationItems.filter((item) => !item.permission || hasPermission(item.permission));

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/dashboard" className="brand">
          <span className="brand-mark">م</span>
          <div>
            <strong>ماریا سی آر ام</strong>
            <small>نسخه سازمانی</small>
          </div>
        </Link>
        <button type="button" className="icon-btn mobile-only" onClick={onClose} aria-label="بستن منو">
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <strong>{user?.full_name || '---'}</strong>
          <small>{user?.email || '---'}</small>
        </div>
        <button type="button" className="btn btn-danger" onClick={logout}>
          <LogOut size={16} />
          خروج
        </button>
      </div>
    </aside>
  );
}

