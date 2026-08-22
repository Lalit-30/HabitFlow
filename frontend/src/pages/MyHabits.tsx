import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Plus, Search, Archive, CheckSquare, Trash2, X, ArrowUpDown, RefreshCw } from 'lucide-react';
import { api, parseApiError } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useHabitActions } from '../hooks/useHabitActions';
import { Habit, Category } from '../types';
import { HabitCard } from '../components/HabitCard';
import { CreateHabitModal } from '../components/CreateHabitModal';

export const MyHabits: React.FC = () => {
  const { showToast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'streak' | 'target'>('name');
  
  // Modals state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [habitsRes, catRes] = await Promise.all([
        api.get<Habit[]>(`/habits?is_archived=${showArchived}${selectedCategory ? `&category_id=${selectedCategory}` : ''}`),
        api.get<Category[]>('/categories')
      ]);
      setHabits(habitsRes.data);
      setCategories(catRes.data);
    } catch (err: any) {
      console.error('Failed to load habits:', err);
      const msg = parseApiError(err, 'Failed to load habits list.');
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [showArchived, selectedCategory, showToast]);

  const { archiveHabit, deleteHabit, actionLoading, pendingHabitIds } = useHabitActions(fetchHabits);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setModalOpen(true);
  };

  const handleArchive = (habitId: string) => {
    archiveHabit(habitId, showArchived);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingHabit) return;
    await deleteHabit(deletingHabit);
    setDeletingHabit(null);
  };

  // Filter & Sort Habits
  const processedHabits = useMemo(() => {
    const result = habits.filter((h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.description && h.description.toLowerCase().includes(search.toLowerCase()))
    );

    result.sort((a, b) => {
      if (sortBy === 'streak') {
        return (b.current_streak || 0) - (a.current_streak || 0);
      }
      if (sortBy === 'target') {
        return b.target_count - a.target_count;
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [habits, search, sortBy]);

  return (
    <div className="space-y-6 animate-pageEnter">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#26313C] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">Habit Management</h1>
          <p className="text-xs sm:text-sm text-[#A8B3C2] mt-0.5">Organize, customize, and maintain your daily & weekly routines</p>
        </div>

        <button
          onClick={() => { setEditingHabit(null); setModalOpen(true); }}
          className="saas-button-primary shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Habit</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="saas-panel p-4 space-y-3.5 border border-[#26313C]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input with Clear Button */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              placeholder="Search habits by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full saas-input pl-9 pr-8 py-2 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#F1F5F9] p-0.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector & Archive Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-xs text-[#A8B3C2]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#718096]" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#111820] border border-[#26313C] text-[#F1F5F9] font-medium rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#4F7CFF] cursor-pointer"
              >
                <option value="name">Name (A-Z)</option>
                <option value="streak">Current Streak</option>
                <option value="target">Target Quantity</option>
              </select>
            </div>

            <div className="h-4 w-px bg-[#26313C] hidden sm:block shrink-0" />

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                showArchived
                  ? 'bg-[#D29922]/10 text-[#D29922] border-[#D29922]/30'
                  : 'bg-[#17212B] border-[#26313C] text-[#A8B3C2] hover:text-[#F1F5F9]'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{showArchived ? 'Showing Archived' : 'Archived'}</span>
            </button>
          </div>
        </div>

        {/* Category Chips Bar */}
        <div className="mobile-chip-scroll border-t border-[#26313C] pt-2.5">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              selectedCategory === ''
                ? 'bg-[#4F7CFF] text-white border-[#4F7CFF]'
                : 'bg-[#17212B] border-[#26313C] text-[#A8B3C2] hover:text-[#F1F5F9]'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#4F7CFF] text-white border-[#4F7CFF]'
                  : 'bg-[#17212B] border-[#26313C] text-[#A8B3C2] hover:text-[#F1F5F9]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Habits Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4F7CFF]" />
        </div>
      ) : error ? (
        <div className="saas-panel p-8 text-center space-y-3 border border-[#F85149]/30 max-w-lg mx-auto my-8">
          <div className="w-10 h-10 rounded-lg bg-[#F85149]/10 text-[#F85149] flex items-center justify-center mx-auto border border-[#F85149]/20">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#F1F5F9]">Failed to Load Habits</h3>
            <p className="text-xs text-[#A8B3C2] mt-1">{error}</p>
          </div>
          <button
            onClick={fetchHabits}
            className="saas-button-primary mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Retry Loading Habits
          </button>
        </div>
      ) : processedHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processedHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isPending={pendingHabitIds.has(habit.id)}
              onEdit={handleEdit}
              onArchive={handleArchive}
              onDelete={() => setDeletingHabit(habit)}
            />
          ))}
        </div>
      ) : (
        <div className="saas-panel p-12 text-center space-y-3 border border-[#26313C]">
          <CheckSquare className="w-10 h-10 text-[#718096] mx-auto" />
          <h3 className="text-base font-semibold text-[#F1F5F9]">
            {search
              ? `No habits match "${search}"`
              : showArchived
              ? 'No archived habits found'
              : 'No habits created yet'}
          </h3>
          <p className="text-xs text-[#718096] max-w-sm mx-auto">
            {search
              ? 'Try searching with a different term or clear the filter.'
              : showArchived
              ? 'Archived habits will appear here when you archive them.'
              : 'Create your first habit to start building consistent daily routines.'}
          </p>
          {!showArchived && !search && (
            <button
              onClick={() => { setEditingHabit(null); setModalOpen(true); }}
              className="mt-2 saas-button-primary mx-auto"
            >
              <Plus className="w-4 h-4" /> Create Habit
            </button>
          )}
        </div>
      )}

      {/* Destructive Action Confirmation Modal */}
      {deletingHabit && (
        <div 
          className="fixed inset-0 z-50 bg-[#0B0F14]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#111820] w-full max-w-md p-6 text-center border border-[#26313C] rounded-xl space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-lg bg-[#F85149]/10 text-[#F85149] flex items-center justify-center mx-auto border border-[#F85149]/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F1F5F9]">Permanently Delete Habit?</h3>
              <p className="text-xs text-[#A8B3C2] mt-1.5 leading-relaxed">
                You are about to delete <strong className="text-[#F1F5F9]">"{deletingHabit.name}"</strong>. This will permanently erase all completion logs and streak records. <span className="text-[#F85149] font-medium">This action cannot be undone.</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#26313C]">
              <button
                type="button"
                onClick={() => setDeletingHabit(null)}
                disabled={actionLoading}
                className="saas-button-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={actionLoading}
                className="saas-button-danger"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Habit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateHabitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchHabits();
          showToast(editingHabit ? 'Habit updated successfully.' : 'Habit created successfully.', 'success');
        }}
        editingHabit={editingHabit}
        categories={categories}
      />
    </div>
  );
};

export default MyHabits;
