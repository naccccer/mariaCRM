import { useMemo, useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { navigationItems } from '../../app/navigation';
import Sidebar from './Sidebar';

export default function AppShell() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const title = useMemo(() => {
    const activeItem = navigationItems.find((item) =>
      location.pathname === item.to || location.pathname.startsWith(`${item.to}/`),
    );

    return activeItem?.label || 'ماریا سی آر ام';
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen ? <button type="button" className="sidebar-overlay" onClick={() => setSidebarOpen(false)} /> : null}

      <main className="app-main">
        <header className="topbar">
          <div>
            <p className="topbar-caption">سیستم مدیریت ارتباط با مشتری</p>
            <h1>{title}</h1>
          </div>
          <button type="button" className="icon-btn mobile-only" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
        </header>

        <section className="content-wrap">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

