import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Trophy, 
  User as UserIcon, 
  LogOut,
  Flame,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/habits', label: 'My Habits', icon: CheckSquare },
    { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/achievements', label: 'Achievements', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
          <Flame className="w-6 h-6 fill-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white leading-tight">HabitFlow</h1>
          <p className="text-xs text-slate-400">Consistency Engine</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Level & XP Widget */}
      {user && (
        <div className="p-4 mx-4 mb-4 glass-card border border-brand-500/20 bg-brand-950/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-amber-300">Level {user.level}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{user.xp} XP</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-brand-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((user.xp % 500) / 500) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer User Info & Logout */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-9 h-9 rounded-full object-cover border border-slate-700 flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-brand-400 flex-shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="truncate">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.full_name}</p>
            <p className="text-xs text-brand-400 font-mono font-semibold">{user?.user_code}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Log Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};
