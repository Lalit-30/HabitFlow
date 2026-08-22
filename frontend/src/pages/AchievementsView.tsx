import React, { useEffect, useState } from 'react';
import { Trophy, Award, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { api, parseApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Achievement } from '../types';

export const AchievementsView: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Achievement[]>('/achievements');
      setAchievements(res.data);
    } catch (err: any) {
      console.error('Failed to load achievements:', err);
      setError(parseApiError(err, 'Failed to load achievements.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const unlockedCount = achievements.filter((a) => a.is_unlocked).length;

  return (
    <div className="space-y-6 animate-pageEnter">
      {/* Level & Gamification Hero */}
      <div className="saas-panel p-6 border border-[#26313C]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-[#D29922]/10 border border-[#D29922]/30 flex items-center justify-center text-[#D29922] shrink-0">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-semibold text-[#D29922] uppercase tracking-wider">Level {user?.level || 1} Explorer</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">Achievements & Badges</h1>
              <p className="text-xs text-[#A8B3C2] mt-0.5">
                Unlocked <span className="text-[#D29922] font-semibold">{unlockedCount} of {achievements.length}</span> milestones
              </p>
            </div>
          </div>

          <div className="bg-[#17212B] p-3.5 px-4 rounded-lg border border-[#26313C] text-right font-mono">
            <p className="text-[10px] text-[#718096] uppercase tracking-wider">Total XP Earned</p>
            <p className="text-2xl font-bold text-[#D29922] mt-0.5">{user?.xp || 0} XP</p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4F7CFF]" />
        </div>
      ) : error ? (
        <div className="saas-panel p-8 text-center space-y-3 border border-[#F85149]/30 max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-[#F85149] mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-[#F1F5F9]">Achievements Unavailable</h3>
            <p className="text-xs text-[#A8B3C2] mt-1">{error}</p>
          </div>
          <button
            onClick={fetchAchievements}
            className="saas-button-primary mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Retry Loading Achievements
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`saas-card p-5 border transition-colors relative overflow-hidden ${
                ach.is_unlocked
                  ? 'border-[#D29922]/40 bg-[#D29922]/5'
                  : 'border-[#26313C] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    ach.is_unlocked
                      ? 'bg-[#D29922]/15 text-[#D29922] border border-[#D29922]/30'
                      : 'bg-[#111820] text-[#718096] border border-[#26313C]'
                  }`}
                >
                  {ach.is_unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>

                <span
                  className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${
                    ach.is_unlocked
                      ? 'bg-[#D29922]/15 text-[#D29922] border-[#D29922]/30'
                      : 'bg-[#111820] text-[#718096] border-[#26313C]'
                  }`}
                >
                  +{ach.xp_reward} XP
                </span>
              </div>

              <h3 className="font-semibold text-base text-[#F1F5F9]">{ach.title}</h3>
              <p className="text-xs text-[#A8B3C2] mt-1">{ach.description}</p>

              {ach.is_unlocked && ach.unlocked_at && (
                <div className="mt-3 pt-2.5 border-t border-[#D29922]/20 flex items-center justify-between text-[10px] text-[#D29922] font-mono">
                  <span>UNLOCKED</span>
                  <span>{new Date(ach.unlocked_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementsView;
