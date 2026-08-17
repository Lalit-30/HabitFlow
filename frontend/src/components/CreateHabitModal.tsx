import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Category, Habit } from '../types';
import { api } from '../services/api';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingHabit?: Habit | null;
  categories: Category[];
}

const COLOR_PALETTE = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'
];

const DAYS_OF_WEEK = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingHabit,
  categories: initialCategories,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [frequencyType, setFrequencyType] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [targetCount, setTargetCount] = useState(1);
  const [targetUnit, setTargetUnit] = useState('times');
  const [color, setColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories if list is empty
  useEffect(() => {
    if (isOpen) {
      if (initialCategories && initialCategories.length > 0) {
        setCategoriesList(initialCategories);
      } else {
        api.get<Category[]>('/categories').then((res) => {
          if (res.data && res.data.length > 0) {
            setCategoriesList(res.data);
          }
        }).catch(() => {});
      }
    }
  }, [isOpen, initialCategories]);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setDescription(editingHabit.description || '');
      setCategoryId(editingHabit.category_id);
      setFrequencyType(editingHabit.frequency_type);
      setDaysOfWeek(editingHabit.scheduled_days || [0, 1, 2, 3, 4, 5, 6]);
      setTargetCount(editingHabit.target_count);
      setTargetUnit(editingHabit.target_unit || 'times');
      setColor(editingHabit.color || '#3B82F6');
    } else {
      setName('');
      setDescription('');
      if (categoriesList.length > 0) {
        setCategoryId(categoriesList[0].id);
      }
      setFrequencyType('daily');
      setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
      setTargetCount(1);
      setTargetUnit('times');
      setColor('#3B82F6');
    }
  }, [editingHabit, categoriesList, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Habit name is required.');
      return;
    }
    
    // Auto fallback to first category if unselected
    let selectedCat = categoryId;
    if (!selectedCat && categoriesList.length > 0) {
      selectedCat = categoriesList[0].id;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        category_id: selectedCat || 'default',
        name: name.trim(),
        description: description.trim() || undefined,
        icon: 'check-circle',
        color,
        frequency_type: frequencyType,
        target_count: targetCount,
        target_unit: targetUnit.trim() || 'times',
        days_of_week: frequencyType === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : daysOfWeek,
      };

      if (editingHabit) {
        await api.put(`/habits/${editingHabit.id}`, payload);
      } else {
        await api.post('/habits', payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      let detail = err.response?.data?.detail;
      let msg = 'Failed to save habit. Please check your inputs.';
      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail)) {
        msg = detail.map((d: any) => d.msg || d.detail).join(', ');
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel w-full max-w-lg p-6 relative border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <h2 className="text-xl font-bold text-white">
            {editingHabit ? 'Edit Habit' : 'Create New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Habit Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Read 20 pages, Exercise, Drink water"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500 text-sm"
            >
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Schedule Frequency
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setFrequencyType('daily'); setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]); }}
                className={`py-2.5 rounded-xl font-medium text-sm border transition-all ${
                  frequencyType === 'daily'
                    ? 'bg-brand-600/20 border-brand-500 text-brand-400 font-semibold'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                Every Day
              </button>
              <button
                type="button"
                onClick={() => setFrequencyType('custom')}
                className={`py-2.5 rounded-xl font-medium text-sm border transition-all ${
                  frequencyType === 'custom'
                    ? 'bg-brand-600/20 border-brand-500 text-brand-400 font-semibold'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                }`}
              >
                Custom Days
              </button>
            </div>
          </div>

          {frequencyType === 'custom' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Select Scheduled Days
              </label>
              <div className="flex gap-1.5 justify-between">
                {DAYS_OF_WEEK.map((day) => {
                  const selected = daysOfWeek.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`w-10 h-10 rounded-xl font-semibold text-xs flex items-center justify-center transition-all ${
                        selected
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Target Count
              </label>
              <input
                type="number"
                min="1"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Unit
              </label>
              <input
                type="text"
                placeholder="pages, liters, times"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-3">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingHabit ? 'Update Habit' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
