import React, { useEffect, useState } from 'react';
import { Flame, Trophy, CheckCircle2, Plus, Activity } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DashboardSummary, Category } from '../types';
import { HabitCard } from '../components/HabitCard';
import { CreateHabitModal } from '../components/CreateHabitModal';

export const Dashboard: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, catRes] = await Promise.all([
        api.get<DashboardSummary>('/dashboard'),
        api.get<Category[]>('/categories')
      ]);
      setData(dashRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleComplete = async (habitId: string, currentlyCompleted: boolean) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      if (currentlyCompleted) {
        await api.delete(`/habits/${habitId}/complete/${todayStr}`);
      } else {
        await api.post(`/habits/${habitId}/complete`, {
          completed_date: todayStr,
          status: 'completed'
        });
      }
      await fetchDashboardData();
      await refetchUser();
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-500" />
      </div>
    );
  }

  const completionPct = data?.completion_percentage || 0;

  return (
    <div className="space-y-8">
      {/* Welcome & Progress Banner */}
      <div className="glass-panel p-8 relative overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-brand-950/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-brand-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <span>Daily Overview</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {getGreeting()}, {user?.full_name?.split(' ')[0]}!
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              You've completed <span className="text-emerald-400 font-semibold">{data?.completed_today} of {data?.total_scheduled_today}</span> habits scheduled for today.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>New Habit</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-slate-400">Today's Progress</span>
            <span className="text-brand-400 font-mono">{completionPct}%</span>
          </div>
          <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Enlarged Metric Cards Grid with Hover Effects */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Stats */}
        <div className="glass-panel p-8 flex items-center gap-5 border border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 hover:scale-[1.03] transition-all duration-300 group cursor-pointer">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-transform">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Today</p>
            <p className="text-3xl font-black text-white font-mono mt-1">
              {data?.completed_today} <span className="text-sm font-normal text-slate-500">/ {data?.total_scheduled_today}</span>
            </p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="glass-panel p-8 flex items-center gap-5 border border-amber-500/20 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 hover:scale-[1.03] transition-all duration-300 group cursor-pointer">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-transform">
            <Flame className="w-8 h-8 fill-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Max Streak</p>
            <p className="text-3xl font-black text-white font-mono mt-1">
              {data?.current_max_streak} <span className="text-sm font-normal text-slate-500">days</span>
            </p>
          </div>
        </div>

        {/* Best Streak */}
        <div className="glass-panel p-8 flex items-center gap-5 border border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:scale-[1.03] transition-all duration-300 group cursor-pointer">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-transform">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Best Ever Streak</p>
            <p className="text-3xl font-black text-white font-mono mt-1">
              {data?.best_ever_streak} <span className="text-sm font-normal text-slate-500">days</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Habits Checklist (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Today's Scheduled Habits</h2>
            <span className="text-xs font-mono bg-slate-850 px-3 py-1 rounded-full text-slate-400 border border-slate-800">
              {data?.today_habits?.length || 0} habits
            </span>
          </div>

          {data?.today_habits && data.today_habits.length > 0 ? (
            <div className="space-y-4">
              {data.today_habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-300">No habits scheduled for today</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Enjoy your off day or create a new daily habit to build consistency.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
              >
                <Plus className="w-4 h-4" /> Create Habit
              </button>
            </div>
          )}
        </div>

        {/* Recent Activity Feed (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          </div>

          <div className="glass-panel p-5 space-y-4 border border-slate-800">
            {data?.recent_activity && data.recent_activity.length > 0 ? (
              <div className="space-y-3">
                {data.recent_activity.map((act) => (
                  <div key={act.completion_id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-850/50 border border-slate-800/50 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-200 truncate">{act.habit_name}</p>
                      <p className="text-slate-500 text-[11px] font-mono mt-0.5">{act.completed_date}</p>
                      {act.notes && (
                        <p className="text-slate-400 text-[11px] italic mt-1 bg-slate-900 p-1.5 rounded border border-slate-800">
                          "{act.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No recent completion logs yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchDashboardData}
        categories={categories}
      />
    </div>
  );
};
