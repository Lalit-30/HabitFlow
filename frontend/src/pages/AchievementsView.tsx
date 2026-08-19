import React, { useEffect, useState } from 'react';
import { Trophy, Award, Target, CheckCircle2, Flame, Lock } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Achievement } from '../types';

export const AchievementsView: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAchievements = async () => {
    try {
      const res = await api.get<Achievement[]>('/achievements');
      setAchievements(res.data);
    } catch (err) {
      console.error('Failed to load achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const unlockedCount = achievements.filter((a) => a.is_unlocked).length;

  return (
    <div className="space-y-8">
      {/* Level & Gamification Hero */}
      <div className="glass-panel p-8 relative overflow-hidden border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
              <Trophy className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Level {user?.level || 1} Explorer</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Achievements & Badges</h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Unlocked <span className="text-amber-400 font-semibold">{unlockedCount} of {achievements.length}</span> milestones
              </p>
            </div>
          </div>

          <div className="bg-slate-850/80 p-4 rounded-xl border border-slate-800 text-right font-mono">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Total XP Earned</p>
            <p className="text-3xl font-black text-amber-400 mt-0.5">{user?.xp || 0} XP</p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`glass-panel p-6 border transition-all relative overflow-hidden ${
                ach.is_unlocked
                  ? 'border-amber-500/40 bg-amber-950/10 shadow-lg shadow-amber-500/5'
                  : 'border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    ach.is_unlocked
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {ach.is_unlocked ? <Award className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                </div>

                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                    ach.is_unlocked
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  +{ach.xp_reward} XP
                </span>
              </div>

              <h3 className="font-bold text-lg text-white">{ach.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{ach.description}</p>

              {ach.is_unlocked && ach.unlocked_at && (
                <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-amber-400 font-mono">
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
