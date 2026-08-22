import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Flame, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Activity, 
  Trophy,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { api, parseApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useHabitActions } from '../hooks/useHabitActions';
import { DashboardSummary, Category, Habit } from '../types';
import { HabitCard } from '../components/HabitCard';
import { CreateHabitModal } from '../components/CreateHabitModal';
import { DashboardSkeleton } from '../components/DashboardSkeleton';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'completed'>('all');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, catRes] = await Promise.all([
        api.get<DashboardSummary>('/dashboard'),
        api.get<Category[]>('/categories')
      ]);
      setData(dashRes.data);
      setCategories(catRes.data);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      const msg = parseApiError(err, 'Failed to load dashboard data. Please try again.');
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const { toggleComplete, pendingHabitIds } = useHabitActions(fetchDashboardData);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleToggleComplete = async (habitId: string, currentCompleted: boolean) => {
    await toggleComplete(habitId, currentCompleted);
  };

  const habitsToday: Habit[] = useMemo(() => data?.today_habits || [], [data?.today_habits]);
  const completedCount = useMemo(() => habitsToday.filter((h: Habit) => h.is_completed_today).length, [habitsToday]);
  const totalCount = habitsToday.length;

  const filteredHabits = useMemo(() => {
    if (filterTab === 'pending') {
      return habitsToday.filter((h: Habit) => !h.is_completed_today);
    }
    if (filterTab === 'completed') {
      return habitsToday.filter((h: Habit) => h.is_completed_today);
    }
    return habitsToday;
  }, [habitsToday, filterTab]);

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center saas-panel border border-[#26313C] max-w-lg mx-auto my-12 space-y-4">
        <AlertCircle className="w-10 h-10 text-[#F85149] mx-auto" />
        <h2 className="text-base font-semibold text-[#F1F5F9]">Failed to Load Dashboard</h2>
        <p className="text-xs text-[#A8B3C2]">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="saas-button-primary mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const completionPct = data?.completion_percentage || 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPct / 100) * circumference;
  const recentWeekDays = data?.recent_week_days || [];

  return (
    <div className="space-y-6 animate-pageEnter">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26313C] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#A8B3C2] mt-0.5">
            Daily consistency overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="saas-button-primary shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Primary Hero Section: Execution Ring & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Execution Rate Ring Card */}
        <div className="saas-panel p-5 flex flex-col justify-between items-center text-center lg:text-left lg:flex-row lg:items-center gap-5">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#17212B"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#3FB950"
                strokeWidth="7"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-[#F1F5F9] font-mono">{Math.round(completionPct)}%</span>
              <span className="text-[9px] text-[#718096] uppercase tracking-wider font-medium">Today</span>
            </div>
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-[#3FB950] uppercase tracking-wider">Today's Execution</span>
            <h2 className="text-base font-semibold text-[#F1F5F9]">
              {completedCount} of {totalCount} habits completed
            </h2>
            {completedCount === totalCount && totalCount > 0 ? (
              <p className="text-xs text-[#3FB950] flex items-center gap-1.5 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Execution Achieved!</span>
              </p>
            ) : (
              <p className="text-xs text-[#A8B3C2]">Keep up the momentum to build consistency.</p>
            )}
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="saas-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D29922]/10 border border-[#D29922]/20 flex items-center justify-center text-[#D29922]">
              <Flame className="w-4 h-4 fill-[#D29922]" />
            </div>
            <div>
              <p className="text-xs text-[#718096] font-medium">Current Streak</p>
              <p className="text-base font-bold text-[#F1F5F9] font-mono">{data?.current_max_streak || 0} Days</p>
              <p className="text-[11px] text-[#A8B3C2] truncate">Active Routine Streak</p>
            </div>
          </div>

          <div className="saas-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#4F7CFF]/10 border border-[#4F7CFF]/20 flex items-center justify-center text-[#4F7CFF]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-[#718096] font-medium">Best Record</p>
              <p className="text-base font-bold text-[#F1F5F9] font-mono">{data?.best_ever_streak || 0} Days</p>
              <p className="text-[11px] text-[#A8B3C2] truncate">All-Time Max Streak</p>
            </div>
          </div>

          <div className="saas-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3FB950]/10 border border-[#3FB950]/20 flex items-center justify-center text-[#3FB950]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-[#718096] font-medium">Scheduled Today</p>
              <p className="text-base font-bold text-[#F1F5F9] font-mono">{totalCount} Habits</p>
              <p className="text-[11px] text-[#A8B3C2] truncate">Daily Routine Goal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Section: Today's Habit Checklist (2 Columns) */}
        <div className="lg:col-span-2 space-y-3.5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-base font-semibold text-[#F1F5F9]">Today's Habits</h2>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#111820] p-1 rounded-lg border border-[#26313C] text-xs">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  filterTab === 'all'
                    ? 'bg-[#17212B] text-[#F1F5F9]'
                    : 'text-[#718096] hover:text-[#A8B3C2]'
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setFilterTab('pending')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  filterTab === 'pending'
                    ? 'bg-[#17212B] text-[#F1F5F9]'
                    : 'text-[#718096] hover:text-[#A8B3C2]'
                }`}
              >
                Pending ({totalCount - completedCount})
              </button>
              <button
                onClick={() => setFilterTab('completed')}
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  filterTab === 'completed'
                    ? 'bg-[#17212B] text-[#F1F5F9]'
                    : 'text-[#718096] hover:text-[#A8B3C2]'
                }`}
              >
                Done ({completedCount})
              </button>
            </div>
          </div>

          {filteredHabits.length > 0 ? (
            <div className="space-y-3">
              {filteredHabits.map((habit: Habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isPending={pendingHabitIds.has(habit.id)}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          ) : (
            <div className="saas-panel p-8 text-center space-y-2 border border-[#26313C]">
              <CheckCircle2 className="w-8 h-8 text-[#718096] mx-auto" />
              <h3 className="text-sm font-medium text-[#F1F5F9]">
                {filterTab === 'pending'
                  ? 'All habits completed for today!'
                  : filterTab === 'completed'
                  ? 'No habits completed yet today.'
                  : 'No habits scheduled for today.'}
              </h3>
              <p className="text-xs text-[#718096] max-w-xs mx-auto">
                {filterTab === 'pending'
                  ? 'You are all caught up! Great effort maintaining your daily routines.'
                  : 'Create a new daily habit to build consistency.'}
              </p>
              {filterTab === 'all' && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-2 saas-button-primary mx-auto"
                >
                  <Plus className="w-4 h-4" /> Create Habit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Weekly Analytics & Activity Feed (1 Column) */}
        <div className="space-y-4">
          {/* Weekly Consistency Dot Matrix Widget */}
          <div className="saas-panel p-4 border border-[#26313C] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4F7CFF]" />
                <h3 className="text-xs font-semibold text-[#F1F5F9]">7-Day Consistency</h3>
              </div>
              <span className="text-[10px] text-[#718096] font-mono">This Week</span>
            </div>

            {recentWeekDays.length > 0 ? (
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {recentWeekDays.map((d: any) => {
                  const rate = d.completion_percentage;
                  let colorClass = 'bg-[#17212B] border-[#26313C] text-[#718096]';
                  if (d.total_scheduled > 0) {
                    if (rate === 100) colorClass = 'bg-[#3FB950]/20 border-[#3FB950]/40 text-[#3FB950]';
                    else if (rate >= 50) colorClass = 'bg-[#4F7CFF]/20 border-[#4F7CFF]/40 text-[#4F7CFF]';
                    else if (rate > 0) colorClass = 'bg-[#D29922]/20 border-[#D29922]/40 text-[#D29922]';
                  }

                  return (
                    <div key={d.date} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-[#718096] font-mono">
                        {d.date.split('-')[2]}
                      </span>
                      <div
                        className={`w-full h-7 rounded border flex items-center justify-center font-mono text-[10px] font-semibold ${colorClass}`}
                        title={`${d.date}: ${d.completed_count}/${d.total_scheduled} completed (${rate}%)`}
                      >
                        {d.completed_count}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#718096] text-center py-3">No recent activity recorded.</p>
            )}
          </div>

          {/* Recent Activity Log */}
          <div className="saas-panel p-4 space-y-3 border border-[#26313C]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4F7CFF]" />
              <h3 className="text-xs font-semibold text-[#F1F5F9]">Recent Activity</h3>
            </div>

            {data?.recent_activity && data.recent_activity.length > 0 ? (
              <div className="space-y-2">
                {data.recent_activity.slice(0, 5).map((act) => (
                  <div key={act.completion_id} className="flex items-center justify-between p-2 rounded bg-[#17212B] border border-[#26313C] text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3FB950] shrink-0" />
                      <span className="font-medium text-[#F1F5F9] truncate">{act.habit_name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#718096] shrink-0">{act.completed_date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#718096] text-center py-3">No completion logs recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Create Habit Modal */}
      <CreateHabitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
          showToast('New habit created successfully!', 'success');
        }}
        categories={categories}
      />
    </div>
  );
};

export default Dashboard;
