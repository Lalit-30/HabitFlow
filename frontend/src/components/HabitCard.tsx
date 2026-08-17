import React, { useState, useRef, useEffect } from 'react';
import { Check, Flame, MoreVertical, Archive, Trash2, Edit3 } from 'lucide-react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onToggleComplete?: (habitId: string, isCompleted: boolean) => void;
  onEdit?: (habit: Habit) => void;
  onArchive?: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleComplete,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isCompleted = !!habit.is_completed_today;

  // Auto-close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className={`glass-card p-5 relative transition-all duration-200 ${isCompleted ? 'border-emerald-500/40 bg-emerald-950/10' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        {/* Left Section: Icon & Info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0"
            style={{ backgroundColor: habit.color || '#3B82F6' }}
          >
            {habit.name.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {habit.category?.name || 'General'}
              </span>
              <span className="text-xs text-slate-400 capitalize">
                {habit.frequency_type}
              </span>
            </div>

            <h3 className="font-semibold text-lg text-white truncate leading-snug">
              {habit.name}
            </h3>

            {habit.description && (
              <p className="text-xs text-slate-400 line-clamp-1">{habit.description}</p>
            )}

            <div className="flex items-center gap-4 pt-2 text-xs font-medium text-slate-300 flex-wrap">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400" />
                <span>{habit.current_streak || 0} day streak</span>
              </div>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                Target: {habit.target_count} {habit.target_unit || 'times'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Check Action & Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {onToggleComplete && (
            <button
              onClick={() => onToggleComplete(habit.id, isCompleted)}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}
              title={isCompleted ? 'Mark as not completed' : 'Mark as completed'}
            >
              <Check className={`w-6 h-6 stroke-[2.5] ${isCompleted ? 'scale-110' : ''}`} />
            </button>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 w-36 glass-panel p-1 z-30 shadow-2xl border border-slate-700 text-xs animate-fadeIn">
                {onEdit && (
                  <button
                    onClick={() => { setShowMenu(false); onEdit(habit); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
                {onArchive && (
                  <button
                    onClick={() => { setShowMenu(false); onArchive(habit.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" /> Archive
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { setShowMenu(false); onDelete(habit.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
