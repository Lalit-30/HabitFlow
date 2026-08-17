import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../services/api';
import { CalendarOverview, CalendarDay } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS_LIST = Array.from({ length: 16 }, (_, i) => 2020 + i); // 2020 to 2035

export const CalendarView: React.FC = () => {
  const today = new Date();
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [data, setData] = useState<CalendarOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const response = await api.get<CalendarOverview>(`/calendar?year=${year}&month=${month}`);
      setData(response.data);
    } catch (err) {
      console.error('Failed to load calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [year, month]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header with Easy Month & Year Switching */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Calendar Heatmap</h1>
          <p className="text-sm text-slate-400">View daily habit completion activity</p>
        </div>

        {/* Enhanced Controls: Prev/Next + Month Dropdown + Year Dropdown */}
        <div className="flex items-center gap-2 glass-panel p-2 border border-slate-800">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Month Dropdown */}
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="bg-slate-800 text-white font-semibold text-xs py-1.5 px-3 rounded-lg border border-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-slate-800 text-white font-mono font-semibold text-xs py-1.5 px-3 rounded-lg border border-slate-700 focus:outline-none focus:border-brand-500 cursor-pointer"
          >
            {YEARS_LIST.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Grid (2 Columns) */}
        <div className="lg:col-span-2 glass-panel p-6 border border-slate-800">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-xs font-semibold text-slate-500 uppercase tracking-wider py-1">
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {/* Padding offset for first day of month */}
              {data?.days && data.days.length > 0 && Array.from({ length: data.days[0].day_of_week }).map((_, i) => (
                <div key={`offset-${i}`} className="h-20 rounded-xl bg-slate-900/30 border border-slate-800/20" />
              ))}

              {data?.days.map((day) => {
                const isSelected = selectedDay?.date === day.date;
                const hasScheduled = day.total_scheduled > 0;
                const rate = day.completion_percentage;

                let bgClass = 'bg-slate-900 border-slate-800/80';
                if (hasScheduled) {
                  if (rate === 100) bgClass = 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300';
                  else if (rate >= 50) bgClass = 'bg-brand-950/40 border-brand-500/40 text-brand-300';
                  else if (rate > 0) bgClass = 'bg-amber-950/30 border-amber-500/30 text-amber-300';
                  else bgClass = 'bg-slate-900/90 border-slate-800 hover:border-slate-700';
                }

                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDay(day)}
                    className={`h-20 p-2 rounded-xl border flex flex-col justify-between transition-all text-left ${bgClass} ${
                      isSelected ? 'ring-2 ring-brand-500 scale-105 z-10 shadow-lg' : 'hover:scale-[1.02]'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-xs font-mono">{day.day_number}</span>
                      {hasScheduled && (
                        <span className="text-[10px] font-mono opacity-80">
                          {day.completed_count}/{day.total_scheduled}
                        </span>
                      )}
                    </div>

                    {hasScheduled && (
                      <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-current h-full rounded-full transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Day Details Panel (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-400" />
            <h2 className="text-xl font-bold text-white">Day Inspection</h2>
          </div>

          {selectedDay ? (
            <div className="glass-panel p-6 space-y-4 border border-slate-800">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-white font-mono">{selectedDay.date}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedDay.completed_count} of {selectedDay.total_scheduled} habits completed ({selectedDay.completion_percentage}%)
                </p>
              </div>

              {selectedDay.habits.length > 0 ? (
                <div className="space-y-3">
                  {selectedDay.habits.map((h) => (
                    <div
                      key={h.habit_id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        h.is_completed
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-850 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {h.is_completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                        )}
                        <span className="font-semibold truncate text-white">{h.name}</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900">
                        {h.is_completed ? 'Done' : 'Missed'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No habits scheduled for this day.</p>
              )}
            </div>
          ) : (
            <div className="glass-panel p-10 text-center text-xs text-slate-500 border border-slate-800">
              Click on any date cell in the calendar grid to inspect scheduled habits & logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
