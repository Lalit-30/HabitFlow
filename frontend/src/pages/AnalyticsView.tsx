import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  AlertCircle, 
  Flame, 
  CheckCircle2, 
  Target
} from 'lucide-react';
import { api, parseApiError } from '../services/api';
import { AnalyticsReport } from '../types';

export const AnalyticsView: React.FC = () => {
  const [range, setRange] = useState<string>('7d');
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<AnalyticsReport>(`/analytics?range=${range}`);
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(parseApiError(err, 'Failed to load analytics data.'));
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Aggregate KPI Calculations
  const averageRate = useMemo(() => {
    if (!data?.completion_trend || data.completion_trend.length === 0) return 0;
    const totalRate = data.completion_trend.reduce((sum, item) => sum + item.rate, 0);
    return Math.round(totalRate / data.completion_trend.length);
  }, [data]);

  const totalCompletions = useMemo(() => {
    if (!data?.completion_trend) return 0;
    return data.completion_trend.reduce((sum, item) => sum + item.completed, 0);
  }, [data]);

  const rangeLabel = useMemo(() => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '3m': return 'Last 3 Months';
      case '1y': return 'Last 1 Year';
      default: return 'Selected Period';
    }
  }, [range]);

  return (
    <div className="space-y-6 animate-pageEnter">
      {/* Header & Date Range Selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#26313C] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">Consistency Analytics</h1>
          <p className="text-xs sm:text-sm text-[#A8B3C2] mt-0.5">Productivity performance and trend metrics</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 bg-[#111820] p-1 rounded-lg border border-[#26313C] text-xs">
          {[
            { label: '7 Days', value: '7d' },
            { label: '30 Days', value: '30d' },
            { label: '3 Months', value: '3m' },
            { label: '1 Year', value: '1y' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setRange(item.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                range === item.value
                  ? 'bg-[#17212B] text-[#F1F5F9]'
                  : 'text-[#718096] hover:text-[#A8B3C2]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-5 animate-pulse" aria-label="Loading analytics">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-20 bg-[#111820] border border-[#26313C] rounded-lg" />
            <div className="h-20 bg-[#111820] border border-[#26313C] rounded-lg" />
            <div className="h-20 bg-[#111820] border border-[#26313C] rounded-lg" />
          </div>
          <div className="h-64 bg-[#111820] border border-[#26313C] rounded-lg" />
        </div>
      ) : error ? (
        <div className="saas-panel p-8 text-center space-y-3 border border-[#F85149]/30 max-w-lg mx-auto my-8">
          <AlertCircle className="w-8 h-8 text-[#F85149] mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-[#F1F5F9]">Analytics Unavailable</h3>
            <p className="text-xs text-[#A8B3C2] mt-1">{error}</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="saas-button-primary mx-auto"
          >
            Retry Analytics
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Executive KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Completion Rate KPI */}
            <div className="saas-panel p-4 border border-[#26313C] flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-[#718096]">Avg Completion Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#F1F5F9] font-mono">{averageRate}%</span>
                  <span className="text-xs font-medium text-[#3FB950] font-mono">({rangeLabel})</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#4F7CFF]/10 border border-[#4F7CFF]/20 flex items-center justify-center text-[#4F7CFF] shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Total Completed Instances */}
            <div className="saas-panel p-4 border border-[#26313C] flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-[#718096]">Completed Routines</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#F1F5F9] font-mono">{totalCompletions}</span>
                  <span className="text-xs font-medium text-[#A8B3C2]">log entries</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#3FB950]/10 border border-[#3FB950]/20 flex items-center justify-center text-[#3FB950] shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Top Routines Active */}
            <div className="saas-panel p-4 border border-[#26313C] flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-[#718096]">Top Performers</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#F1F5F9] font-mono">
                    {data?.best_performing?.length || 0}
                  </span>
                  <span className="text-xs font-medium text-[#D29922]">active routines</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#D29922]/10 border border-[#D29922]/20 flex items-center justify-center text-[#D29922] shrink-0">
                <Flame className="w-5 h-5 fill-[#D29922]" />
              </div>
            </div>
          </div>

          {/* Primary Visualization: Completion Rate Trend Line/Area Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 saas-panel p-5 border border-[#26313C] space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#4F7CFF]" />
                  <span>Completion Rate Trend (%)</span>
                </h2>
                <p className="text-xs text-[#718096] mt-0.5">
                  Percentage of scheduled habits completed over {rangeLabel.toLowerCase()}
                </p>
              </div>

              {data?.completion_trend && data.completion_trend.length > 0 ? (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.completion_trend}>
                      <defs>
                        <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F7CFF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4F7CFF" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="day" 
                        stroke="#718096" 
                        fontSize={11} 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#718096" 
                        fontSize={11} 
                        domain={[0, 100]} 
                        unit="%" 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: '#17212B', 
                          borderColor: '#26313C', 
                          borderRadius: '8px', 
                          color: '#F1F5F9',
                          fontSize: '12px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                        }}
                        formatter={(val: any) => [`${val}%`, 'Completion Rate']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="#4F7CFF" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#rateGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-[#718096] text-center py-16">No completion data recorded for this timeframe.</p>
              )}
            </div>

            {/* Category Focus Breakdown */}
            <div className="saas-panel p-5 border border-[#26313C] space-y-3">
              <div>
                <h2 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#4F7CFF]" />
                  <span>Category Distribution</span>
                </h2>
                <p className="text-xs text-[#718096] mt-0.5">Focus areas by habit count</p>
              </div>

              {data?.category_breakdown && data.category_breakdown.length > 0 ? (
                <div className="space-y-3 pt-1">
                  <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.category_breakdown}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={68}
                          paddingAngle={3}
                        >
                          {data.category_breakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#4F7CFF'} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#17212B', borderColor: '#26313C', borderRadius: '8px', color: '#F1F5F9', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-1.5">
                    {data.category_breakdown.map((cat) => (
                      <div key={cat.category_id} className="flex items-center justify-between text-xs p-2 rounded bg-[#17212B] border border-[#26313C]">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="text-[#F1F5F9] font-medium truncate">{cat.name}</span>
                        </div>
                        <span className="font-mono text-[#A8B3C2] font-semibold shrink-0">{cat.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#718096] text-center py-12">No category logs recorded.</p>
              )}
            </div>
          </div>

          {/* Performance Leaderboards: Top Performers vs Needs Attention */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Top Performing Routines */}
            <div className="saas-panel p-5 border border-[#26313C] space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D29922]" />
                <div>
                  <h2 className="text-sm font-semibold text-[#F1F5F9]">Top Performing Routines</h2>
                  <p className="text-xs text-[#718096]">Routines with highest completion rates</p>
                </div>
              </div>

              {data?.best_performing && data.best_performing.length > 0 ? (
                <div className="space-y-2.5">
                  {data.best_performing.map((h, i) => (
                    <div key={h.id} className="p-3 rounded-lg bg-[#17212B] border border-[#26313C] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded bg-[#D29922]/10 text-[#D29922] font-bold text-xs flex items-center justify-center font-mono shrink-0">
                          #{i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-[#F1F5F9] truncate">{h.name}</p>
                          <div className="flex items-center gap-1 text-[11px] text-[#D29922]">
                            <Flame className="w-3 h-3 fill-[#D29922] shrink-0" />
                            <span>{h.current_streak} day streak</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#3FB950] shrink-0">
                        {h.completion_percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#718096] text-center py-6">No performance records yet.</p>
              )}
            </div>

            {/* Routines Needing Attention */}
            <div className="saas-panel p-5 border border-[#26313C] space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#4F7CFF]" />
                <div>
                  <h2 className="text-sm font-semibold text-[#F1F5F9]">Needs Attention</h2>
                  <p className="text-xs text-[#718096]">Routines with lower completion consistency</p>
                </div>
              </div>

              {data?.worst_performing && data.worst_performing.length > 0 ? (
                <div className="space-y-2.5">
                  {data.worst_performing.map((h) => (
                    <div key={h.id} className="p-3 rounded-lg bg-[#17212B] border border-[#26313C] flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-[#F1F5F9] truncate">{h.name}</p>
                        <p className="text-[11px] text-[#718096]">{h.total_completions} total completions</p>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#A8B3C2] shrink-0">
                        {h.completion_percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#718096] text-center py-6">All routines performing well!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
