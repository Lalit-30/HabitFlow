import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { api, parseApiError } from '../services/api';
import { CalendarOverview, CalendarDay } from '../types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS_LIST = Array.from({ length: 16 }, (_, i) => 2020 + i);

export const CalendarView: React.FC = () => {
  const [today] = useState(new Date());
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [data, setData] = useState<CalendarOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<CalendarOverview>(`/calendar?year=${year}&month=${month}`);
      setData(response.data);
    } catch (err: any) {
      console.error('Failed to load calendar:', err);
      setError(parseApiError(err, 'Failed to load calendar data.'));
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

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
    <div className="space-y-6 animate-pageEnter">
      {/* Calendar Header with Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#26313C] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">Calendar Activity</h1>
          <p className="text-xs sm:text-sm text-[#A8B3C2] mt-0.5">View daily habit completion activity & inspect monthly logs</p>
        </div>

        {/* Controls: Prev/Next + Month Dropdown + Year Dropdown */}
        <div className="flex items-center gap-1.5 bg-[#111820] p-1.5 rounded-lg border border-[#26313C]">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-[#718096] hover:text-[#F1F5F9] rounded hover:bg-[#17212B] transition-colors"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="bg-[#17212B] text-[#F1F5F9] font-medium text-xs py-1 px-2.5 rounded border border-[#26313C] focus:outline-none focus:border-[#4F7CFF] cursor-pointer"
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-[#17212B] text-[#F1F5F9] font-mono font-medium text-xs py-1 px-2.5 rounded border border-[#26313C] focus:outline-none focus:border-[#4F7CFF] cursor-pointer"
          >
            {YEARS_LIST.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextMonth}
            className="p-1 text-[#718096] hover:text-[#F1F5F9] rounded hover:bg-[#17212B] transition-colors"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error ? (
        <div className="saas-panel p-8 text-center space-y-3 border border-[#F85149]/30 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-[#F85149] mx-auto" />
          <div>
            <h2 className="text-base font-semibold text-[#F1F5F9]">Failed to Load Calendar</h2>
            <p className="text-xs text-[#A8B3C2] mt-1">{error}</p>
          </div>
          <button
            onClick={fetchCalendar}
            className="saas-button-primary mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Month Grid */}
          <div className="lg:col-span-2 saas-panel p-5 border border-[#26313C] space-y-3">
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider py-1 font-mono">
                  {d}
                </div>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-7 gap-1.5 animate-pulse" aria-label="Loading calendar">
                {Array.from({ length: 31 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-lg bg-[#17212B] border border-[#26313C]" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5">
                {data?.days && data.days.length > 0 && Array.from({ length: data.days[0].day_of_week }).map((_, i) => (
                  <div key={`offset-${i}`} className="h-14 sm:h-16 rounded-lg bg-[#111820]/40 border border-[#26313C]/20" />
                ))}

                {data?.days.map((day) => {
                  const isSelected = selectedDay?.date === day.date;
                  const hasScheduled = day.total_scheduled > 0;
                  const rate = day.completion_percentage;

                  let bgClass = 'bg-[#111820] border-[#26313C]';
                  if (hasScheduled) {
                    if (rate === 100) bgClass = 'bg-[#3FB950]/15 border-[#3FB950]/40 text-[#3FB950]';
                    else if (rate >= 50) bgClass = 'bg-[#4F7CFF]/15 border-[#4F7CFF]/40 text-[#4F7CFF]';
                    else if (rate > 0) bgClass = 'bg-[#D29922]/15 border-[#D29922]/40 text-[#D29922]';
                    else bgClass = 'bg-[#111820] border-[#26313C] hover:border-[#3A4959]';
                  }

                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDay(day)}
                      className={`h-14 sm:h-16 p-1.5 sm:p-2 rounded-lg border flex flex-col justify-between transition-all text-left ${bgClass} ${
                        isSelected ? 'ring-2 ring-[#4F7CFF] z-10' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-semibold text-xs font-mono text-[#F1F5F9]">{day.day_number}</span>
                        {hasScheduled && (
                          <span className="text-[10px] font-mono opacity-80">
                            {day.completed_count}/{day.total_scheduled}
                          </span>
                        )}
                      </div>

                      {hasScheduled && (
                        <div className="w-full bg-[#111820] h-1 rounded-full overflow-hidden">
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

          {/* Selected Day Inspection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#4F7CFF]" />
              <h2 className="text-base font-semibold text-[#F1F5F9]">Day Inspection</h2>
            </div>

            {selectedDay ? (
              <div className="saas-panel p-4 space-y-3 border border-[#26313C]">
                <div className="border-b border-[#26313C] pb-2.5">
                  <h3 className="font-semibold text-sm text-[#F1F5F9] font-mono">{selectedDay.date}</h3>
                  <p className="text-xs text-[#A8B3C2] mt-0.5">
                    {selectedDay.completed_count} of {selectedDay.total_scheduled} habits completed ({selectedDay.completion_percentage}%)
                  </p>
                </div>

                {selectedDay.habits.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDay.habits.map((h) => (
                      <div
                        key={h.habit_id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between gap-2.5 text-xs ${
                          h.is_completed
                            ? 'bg-[#3FB950]/10 border-[#3FB950]/30 text-[#3FB950]'
                            : 'bg-[#17212B] border-[#26313C] text-[#A8B3C2]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {h.is_completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3FB950] shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-[#718096] shrink-0" />
                          )}
                          <span className="font-medium truncate text-[#F1F5F9]">{h.name}</span>
                        </div>
                        <span className="font-mono text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#111820]">
                          {h.is_completed ? 'Done' : 'Missed'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#718096] text-center py-6">No habits scheduled for this day.</p>
                )}
              </div>
            ) : (
              <div className="saas-panel p-6 text-center text-xs text-[#718096] border border-[#26313C]">
                Click on any date cell in the calendar grid to inspect scheduled habits & logs.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
