import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Archive, CheckSquare } from 'lucide-react';
import { api } from '../services/api';
import { Habit, Category } from '../types';
import { HabitCard } from '../components/HabitCard';
import { CreateHabitModal } from '../components/CreateHabitModal';

export const MyHabits: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const fetchHabits = async () => {
    try {
      const [habitsRes, catRes] = await Promise.all([
        api.get<Habit[]>(`/habits?is_archived=${showArchived}${selectedCategory ? `&category_id=${selectedCategory}` : ''}`),
        api.get<Category[]>('/categories')
      ]);
      setHabits(habitsRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [showArchived, selectedCategory]);

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setModalOpen(true);
  };

  const handleArchive = async (habitId: string) => {
    try {
      if (showArchived) {
        await api.patch(`/habits/${habitId}/restore`);
      } else {
        await api.patch(`/habits/${habitId}/archive`);
      }
      fetchHabits();
    } catch (err) {
      console.error('Failed to archive/restore habit:', err);
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this habit?')) return;
    try {
      await api.delete(`/habits/${habitId}`);
      fetchHabits();
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  };

  const filteredHabits = habits.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Habits</h1>
          <p className="text-sm text-slate-400">Manage and track your routines</p>
        </div>

        <button
          onClick={() => { setEditingHabit(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create Habit</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search habits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-xs"
          />
        </div>

        {/* Category Chips & Archive Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === ''
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-800 hidden md:block" />

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              showArchived
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Showing Archived' : 'Archived'}</span>
          </button>
        </div>
      </div>

      {/* Habits Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-500" />
        </div>
      ) : filteredHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={handleEdit}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel p-16 text-center space-y-3 border border-slate-800">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">
            {showArchived ? 'No archived habits found' : 'No habits created yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {showArchived
              ? 'Archived habits will appear here.'
              : 'Create your first habit to start building consistent daily routines.'}
          </p>
          {!showArchived && (
            <button
              onClick={() => { setEditingHabit(null); setModalOpen(true); }}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-500/25"
            >
              <Plus className="w-4 h-4" /> Create Habit
            </button>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateHabitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchHabits}
        editingHabit={editingHabit}
        categories={categories}
      />
    </div>
  );
};
