import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Trophy, 
  User as UserIcon, 
  LogOut,
  Flame,
  ShieldCheck,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = !!user?.is_admin;

  // ESC key listener for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const mainNavItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/habits', label: 'My Habits', icon: CheckSquare },
    { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/achievements', label: 'Achievements', icon: Trophy },
  ];

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'Dashboard';
      case '/habits': return 'My Habits';
      case '/calendar': return 'Calendar';
      case '/analytics': return 'Analytics';
      case '/achievements': return 'Achievements';
      case '/profile': return 'Profile & Settings';
      case '/admin': return 'System Admin';
      default: return 'HabitFlow';
    }
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full bg-[#111820] text-[#F1F5F9]">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#26313C] flex items-center justify-between shrink-0">
        <NavLink to="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/50 rounded-lg p-1">
          <div className="w-8 h-8 rounded-lg bg-[#4F7CFF] flex items-center justify-center text-white shadow-sm">
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-[#F1F5F9] leading-tight tracking-tight">HabitFlow</h1>
            <p className="text-[11px] text-[#718096] font-mono">Routine Engine</p>
          </div>
        </NavLink>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 text-[#A8B3C2] hover:text-[#F1F5F9] rounded-lg hover:bg-[#17212B] transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Core Navigation Group */}
        <div>
          <p className="px-3 text-[10px] font-semibold text-[#718096] uppercase tracking-wider mb-2 font-mono">
            Core Workspace
          </p>
          <nav className="space-y-1" aria-label="Main menu">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#17212B] text-[#F1F5F9] font-semibold border-l-2 border-[#4F7CFF] pl-2.5'
                      : 'text-[#A8B3C2] hover:text-[#F1F5F9] hover:bg-[#17212B]/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-[#4F7CFF]' : 'text-[#718096]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#4F7CFF]" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* System Administration Group (Admin Only) */}
        {isAdmin && (
          <div>
            <p className="px-3 text-[10px] font-semibold text-[#718096] uppercase tracking-wider mb-2 font-mono">
              Administration
            </p>
            <nav className="space-y-1" aria-label="Admin menu">
              <NavLink
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#17212B] text-[#F1F5F9] font-semibold border-l-2 border-[#F85149] pl-2.5'
                      : 'text-[#A8B3C2] hover:text-[#F1F5F9] hover:bg-[#17212B]/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className={`w-4 h-4 ${isActive ? 'text-[#F85149]' : 'text-[#718096]'}`} />
                      <span>System Admin</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#F85149]" />}
                  </>
                )}
              </NavLink>
            </nav>
          </div>
        )}

        {/* Account Settings Group */}
        <div>
          <p className="px-3 text-[10px] font-semibold text-[#718096] uppercase tracking-wider mb-2 font-mono">
            Account
          </p>
          <nav className="space-y-1" aria-label="Account menu">
            <NavLink
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors duration-150 ${
                  isActive
                    ? 'bg-[#17212B] text-[#F1F5F9] font-semibold border-l-2 border-[#4F7CFF] pl-2.5'
                    : 'text-[#A8B3C2] hover:text-[#F1F5F9] hover:bg-[#17212B]/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <UserIcon className={`w-4 h-4 ${isActive ? 'text-[#4F7CFF]' : 'text-[#718096]'}`} />
                    <span>Profile & Preferences</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#4F7CFF]" />}
                </>
              )}
            </NavLink>
          </nav>
        </div>
      </div>

      {/* User Progress Badge */}
      {user && (
        <div className="p-3 mx-3 mb-3 bg-[#17212B] border border-[#26313C] rounded-lg shrink-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#F1F5F9] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-[#D29922] text-[#D29922]" />
              <span>Level {user.level}</span>
            </span>
            <span className="text-[#A8B3C2] font-mono text-[11px]">{user.xp} XP</span>
          </div>
          <div className="w-full bg-[#111820] h-1.5 rounded-full overflow-hidden border border-[#26313C]/40">
            <div 
              className="bg-[#4F7CFF] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, ((user.xp % 500) / 500) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* User Profile & Logout Footer */}
      <div className="p-3.5 border-t border-[#26313C] flex items-center justify-between gap-3 shrink-0">
        <NavLink
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              loading="lazy"
              decoding="async"
              className="w-8 h-8 rounded-full object-cover border border-[#26313C] shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#17212B] border border-[#26313C] flex items-center justify-center font-semibold text-xs text-[#4F7CFF] shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#F1F5F9] truncate leading-tight">{user?.full_name}</p>
            <p className="text-[11px] text-[#718096] truncate">{user?.email}</p>
          </div>
        </NavLink>

        <button
          onClick={logout}
          className="p-1.5 text-[#718096] hover:text-[#F85149] hover:bg-[#F85149]/10 rounded-lg transition-colors cursor-pointer"
          title="Sign Out"
          aria-label="Sign Out of account"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Context Header Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-[#111820] border-b border-[#26313C] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#4F7CFF] flex items-center justify-center text-white shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-white" />
          </div>
          <div>
            <span className="font-semibold text-sm text-[#F1F5F9] block leading-tight">HabitFlow</span>
            <span className="text-[10px] text-[#718096] block font-medium">
              {getPageTitle(location.pathname)}
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-[#A8B3C2] hover:text-[#F1F5F9] rounded-lg bg-[#17212B] border border-[#26313C] transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-[#0B0F14]/80 backdrop-blur-xs animate-fadeIn"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-[#111820] border-r border-[#26313C] flex flex-col h-full z-10 shadow-xl animate-slideRight">
            {renderNavContent()}
          </aside>
        </div>
      )}

      {/* Desktop Fixed Width Sidebar (256px / w-64) */}
      <aside className="hidden md:flex w-64 bg-[#111820] border-r border-[#26313C] flex-col h-screen sticky top-0 z-30 shrink-0">
        {renderNavContent()}
      </aside>
    </>
  );
};

export default Sidebar;
