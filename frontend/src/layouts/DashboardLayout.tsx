import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { NotificationBell } from '../components/NotificationBell';
import { useAuth } from '../context/AuthContext';

const defaultNav = [{ to: 'dashboard', label: 'Dashboard', end: true }];

export function DashboardLayout({
  title,
  navItems = defaultNav,
}: {
  title: string;
  navItems?: { to: string; label: string; end?: boolean }[];
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const sidebar = (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-slate-950 text-white transition-transform md:static md:translate-x-0 ${
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-xs font-medium tracking-wide text-slate-400">Contributor Website</p>
        <h1 className="mt-1 text-lg font-semibold">{title}</h1>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm transition ${
                isActive ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <p className="truncate px-3 text-sm font-medium">{user?.name}</p>
        <p className="truncate px-3 text-xs text-slate-400">{user?.email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 w-full rounded-md px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      {menuOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-slate-950/40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      {sidebar}
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="md:hidden">
            <p className="text-xs text-slate-500">Contributor Website</p>
            <p className="text-sm font-semibold">{title}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium md:hidden"
            >
              Menu
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
