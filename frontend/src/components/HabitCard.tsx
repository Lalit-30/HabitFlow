import React, { useState, useRef, useEffect } from 'react';
import { Check, Flame, MoreVertical, Archive, Trash2, Edit3 } from 'lucide-react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  isPending?: boolean;
  onToggleComplete?: (habitId: string, isCompleted: boolean) => void;
  onEdit?: (habit: Habit) => void;
  onArchive?: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = React.memo(({
  habit,
  isPending,
  onToggleComplete,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isCompleted = !!habit.is_completed_today;

  // Auto-close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMenu]);

  return (
    <div 
      className={`saas-card p-4 relative transition-colors duration-150 border ${
        isCompleted 
          ? 'border-[#3FB950]/40 bg-[#3FB950]/5' 
          : 'border-[#26313C] hover:border-[#3A4959]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Section: Icon & Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-base shadow-xs flex-shrink-0"
            style={{ backgroundColor: habit.color || '#4F7CFF' }}
            aria-hidden="true"
          >
            {habit.name.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#111820] text-[#A8B3C2] border border-[#26313C]">
                {habit.category?.name || 'General'}
              </span>
              <span className="text-[11px] text-[#718096] capitalize">
                {habit.frequency_type}
              </span>
            </div>

            <h3 className="font-semibold text-base text-[#F1F5F9] truncate leading-snug">
              {habit.name}
            </h3>

            {habit.description && (
              <p className="text-xs text-[#A8B3C2] line-clamp-1">{habit.description}</p>
            )}

            <div className="flex items-center gap-3 pt-1.5 text-xs font-medium text-[#A8B3C2] flex-wrap">
              <div className="flex items-center gap-1.5 text-[#D29922]">
                <Flame className="w-3.5 h-3.5 fill-[#D29922]" />
                <span>{habit.current_streak || 0} day streak</span>
              </div>
              <span className="text-[#26313C]" aria-hidden="true">•</span>
              <span className="text-[#718096]">
                Target: {habit.target_count} {habit.target_unit || 'times'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Check Action & Menu */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onToggleComplete && (
            <button
              onClick={() => onToggleComplete(habit.id, isCompleted)}
              disabled={isPending}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3FB950]/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isCompleted
                  ? 'bg-[#3FB950] text-white shadow-xs'
                  : 'bg-[#111820] border border-[#26313C] text-[#718096] hover:text-[#F1F5F9] hover:border-[#3A4959]'
              }`}
              title={isPending ? 'Processing habit update...' : isCompleted ? `Mark ${habit.name} as not completed` : `Mark ${habit.name} as completed`}
              aria-label={isCompleted ? `Mark ${habit.name} as incomplete` : `Mark ${habit.name} as completed`}
            >
              <Check className={`w-5 h-5 stroke-[2.5] ${isCompleted ? 'animate-checkPop' : ''} ${isPending ? 'animate-pulse' : ''}`} />
            </button>
          )}

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 flex items-center justify-center text-[#718096] hover:text-[#F1F5F9] rounded-lg hover:bg-[#111820] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/30 active:scale-95"
              aria-label={`Actions for ${habit.name}`}
              aria-expanded={showMenu}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-11 w-40 bg-[#111820] p-1.5 z-30 shadow-lg border border-[#26313C] rounded-lg text-xs animate-modalEnter">
                {onEdit && (
                  <button
                    onClick={() => { setShowMenu(false); onEdit(habit); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-[#A8B3C2] hover:text-[#F1F5F9] hover:bg-[#17212B] rounded transition-colors cursor-pointer text-left font-medium"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#4F7CFF]" /> Edit Habit
                  </button>
                )}
                {onArchive && (
                  <button
                    onClick={() => { setShowMenu(false); onArchive(habit.id); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-[#A8B3C2] hover:text-[#F1F5F9] hover:bg-[#17212B] rounded transition-colors cursor-pointer text-left font-medium"
                  >
                    <Archive className="w-3.5 h-3.5 text-[#D29922]" /> {habit.is_archived ? 'Restore' : 'Archive'}
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { setShowMenu(false); onDelete(habit.id); }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-[#F85149] hover:bg-[#F85149]/10 rounded transition-colors cursor-pointer text-left font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Habit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
