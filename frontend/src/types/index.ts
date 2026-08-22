export interface User {
  id: string;
  user_code: string;
  email: string;
  full_name: string;
  xp: number;
  level: number;
  is_active: boolean;
  is_admin?: boolean;
  avatar_url?: string;
  age?: number;
  dob?: string;
  gender?: string;
  city?: string;
  country?: string;
  height?: number;
  weight?: number;
  health_goal?: string;
  created_at: string;
  habits_count?: number;
  completions_count?: number;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  icon: string;
  color: string;
  is_system: boolean;
}

export interface Habit {
  id: string;
  user_id: string;
  category_id: string;
  category?: Category;
  name: string;
  description?: string;
  icon: string;
  color: string;
  frequency_type: 'daily' | 'weekly' | 'custom';
  target_count: number;
  target_unit?: string;
  start_date: string;
  reminder_time?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  scheduled_days: number[];
  is_completed_today?: boolean;
  current_streak?: number;
  longest_streak?: number;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_date: string;
  status: 'completed' | 'skipped' | 'failed';
  notes?: string;
  completed_at: string;
  user_xp?: number;
  user_level?: number;
}

export interface DashboardSummary {
  date: string;
  total_scheduled_today: number;
  completed_today: number;
  completion_percentage: number;
  current_max_streak: number;
  best_ever_streak: number;
  today_habits: Habit[];
  recent_week_days?: {
    date: string;
    day_number: number;
    day_of_week: number;
    total_scheduled: number;
    completed_count: number;
    completion_percentage: number;
  }[];
  recent_activity: {
    completion_id: string;
    habit_id: string;
    habit_name: string;
    completed_date: string;
    status: string;
    notes?: string;
  }[];
}

export interface CalendarDay {
  date: string;
  day_number: number;
  day_of_week: number;
  total_scheduled: number;
  completed_count: number;
  completion_percentage: number;
  habits: {
    habit_id: string;
    name: string;
    icon: string;
    color: string;
    is_completed: boolean;
    notes?: string;
  }[];
}

export interface CalendarOverview {
  year: number;
  month: number;
  days: CalendarDay[];
}

export interface AnalyticsReport {
  range: string;
  completion_trend: {
    date: string;
    day: string;
    completed: number;
    scheduled: number;
    rate: number;
  }[];
  category_breakdown: {
    category_id: string;
    name: string;
    color: string;
    icon: string;
    count: number;
    percentage: number;
  }[];
  best_performing: {
    id: string;
    name: string;
    icon: string;
    color: string;
    current_streak: number;
    longest_streak: number;
    total_completions: number;
    completion_percentage: number;
  }[];
  worst_performing: {
    id: string;
    name: string;
    icon: string;
    color: string;
    current_streak: number;
    longest_streak: number;
    total_completions: number;
    completion_percentage: number;
  }[];
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  badge_icon: string;
  xp_reward: number;
  is_unlocked: boolean;
  unlocked_at?: string;
}
