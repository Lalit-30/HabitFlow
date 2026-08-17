import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, AlertCircle, Flame } from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsReport } from '../types';

export const AnalyticsView: React.FC = () => {
  const [range, setRange] = useState<string>('7d');
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get<AnalyticsReport>(`/analytics?range=${range}`);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  return (
    <div className="space-y-6">
      {/* Header & Range Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & Insights</h1>
          <p className="text-sm text-slate-400">Track progress trends and habit performance</p>
        </div>

        <div className="flex items-center gap-1.5 glass-panel p-1.5 border border-slate-800">
          {[
            { label: '7 Days', value: '7d' },
            { label: '30 Days', value: '30d' },
            { label: '3 Months', value: '3m' },
            { label: '1 Year', value: '1y' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setRange(item.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                range === item.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Completion Trend Bar Chart (2 Columns) */}
            <div className="lg:col-span-2 glass-panel p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-bold text-white">Completion Trend (%)</h2>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.completion_trend || []}>
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} unit="%" tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                      formatter={(val: any) => [`${val}%`, 'Completion Rate']}
                    />
                    <Bar dataKey="rate" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown Donut (1 Column) */}
            <div className="glass-panel p-6 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">Category Distribution</h2>

              {data?.category_breakdown && data.category_breakdown.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.category_breakdown}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                        >
                          {data.category_breakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2">
                    {data.category_breakdown.map((cat) => (
                      <div key={cat.category_id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-slate-300 font-medium">{cat.name}</span>
                        </div>
                        <span className="font-mono text-slate-400">{cat.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-12">No completion logs recorded in this period.</p>
              )}
            </div>
          </div>

          {/* Leaderboards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Performing Habits */}
            <div className="glass-panel p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Top Performing Habits</h2>
              </div>

              {data?.best_performing && data.best_performing.length > 0 ? (
                <div className="space-y-3">
                  {data.best_performing.map((h, i) => (
                    <div key={h.id} className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
                          #{i + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-sm text-white">{h.name}</p>
                          <div className="flex items-center gap-2 text-xs text-amber-400">
                            <Flame className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{h.current_streak} day streak</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-sm text-emerald-400">
                        {h.completion_percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No data available.</p>
              )}
            </div>

            {/* Needs Improvement */}
            <div className="glass-panel p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Needs Improvement</h2>
              </div>

              {data?.worst_performing && data.worst_performing.length > 0 ? (
                <div className="space-y-3">
                  {data.worst_performing.map((h) => (
                    <div key={h.id} className="p-3.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-white">{h.name}</p>
                        <p className="text-xs text-slate-400">{h.total_completions} completions total</p>
                      </div>
                      <span className="font-mono font-bold text-sm text-slate-300">
                        {h.completion_percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No data available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
