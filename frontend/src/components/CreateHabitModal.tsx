import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { Category, Habit } from '../types';
import { api, parseApiError } from '../services/api';

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
  const [serverError, setServerError] = useState('');

  const firstInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    targetCount?: string;
    daysOfWeek?: string;
  }>({});

  // Focus Management: Save trigger element & restore focus on modal close
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      setTimeout(() => firstInputRef.current?.focus(), 50);
    } else if (triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [isOpen]);

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
    setFieldErrors({});
    setServerError('');
  }, [editingHabit, categoriesList, isOpen]);

  // Handle ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleDay = (day: number) => {
    let updated: number[];
    if (daysOfWeek.includes(day)) {
      updated = daysOfWeek.filter((d) => d !== day);
    } else {
      updated = [...daysOfWeek, day].sort();
    }
    setDaysOfWeek(updated);
    if (updated.length > 0) {
      setFieldErrors((prev) => ({ ...prev, daysOfWeek: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; targetCount?: string; daysOfWeek?: string } = {};

    if (!name.trim()) {
      errors.name = 'Habit name is required.';
    } else if (name.trim().length < 2) {
      errors.name = 'Habit name must be at least 2 characters.';
    }

    if (targetCount < 1) {
      errors.targetCount = 'Target count must be at least 1.';
    }

    if (frequencyType === 'custom' && daysOfWeek.length === 0) {
      errors.daysOfWeek = 'Please select at least one day for custom frequency schedule.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    let selectedCat = categoryId;
    if (!selectedCat && categoriesList.length > 0) {
      selectedCat = categoriesList[0].id;
    }

    setLoading(true);
    setServerError('');

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
      const msg = parseApiError(err, 'Failed to save habit. Please check your inputs.');
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0B0F14]/80 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-[#111820] w-full sm:max-w-lg p-5 sm:p-6 relative border border-[#26313C] shadow-xl max-h-[92vh] overflow-y-auto rounded-t-xl sm:rounded-xl animate-modalEnter">
        <div className="flex items-center justify-between border-b border-[#26313C] pb-4 mb-5">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-[#F1F5F9]">
              {editingHabit ? 'Edit Habit' : 'Create New Habit'}
            </h2>
            <p className="text-xs text-[#718096] mt-0.5">
              {editingHabit ? 'Update routine target & schedule parameters' : 'Define a consistent daily or custom routine target'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#718096] hover:text-[#F1F5F9] rounded-lg hover:bg-[#17212B] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/30"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {serverError && (
          <div className="mb-5 p-3 bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] rounded-lg text-xs font-medium flex items-center gap-2" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Habit Name */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="habit-name" className="block text-xs font-medium text-[#A8B3C2]">
                Habit Name <span className="text-[#F85149]">*</span>
              </label>
              <span className="text-[11px] text-[#718096]">e.g. Read 20 pages, Hydrate</span>
            </div>
            <input
              id="habit-name"
              ref={firstInputRef}
              type="text"
              placeholder="e.g. Morning Exercise, Drink Water"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={`w-full saas-input ${
                fieldErrors.name ? 'border-[#F85149]' : ''
              }`}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'habit-name-error' : undefined}
            />
            {fieldErrors.name && (
              <p id="habit-name-error" className="text-xs text-[#F85149] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.name}</span>
              </p>
            )}
          </div>

          {/* Habit Description */}
          <div>
            <label htmlFor="habit-desc" className="block text-xs font-medium text-[#A8B3C2] mb-1">
              Description / Motivation <span className="text-[#718096] font-normal lowercase">(optional)</span>
            </label>
            <input
              id="habit-desc"
              type="text"
              placeholder="e.g. 2 liters daily for better energy & focus"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full saas-input"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label htmlFor="habit-category" className="block text-xs font-medium text-[#A8B3C2] mb-1">
              Category
            </label>
            <select
              id="habit-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full saas-input cursor-pointer"
            >
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Frequency Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#A8B3C2]">
                Schedule Frequency
              </label>
              <span className="text-[11px] text-[#718096]">When should this repeat?</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setFrequencyType('daily');
                  setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
                  setFieldErrors((prev) => ({ ...prev, daysOfWeek: undefined }));
                }}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  frequencyType === 'daily'
                    ? 'bg-[#17212B] border-[#4F7CFF] text-[#F1F5F9]'
                    : 'bg-[#111820] border-[#26313C] text-[#A8B3C2] hover:text-[#F1F5F9]'
                }`}
              >
                Every Day (7 Days/Wk)
              </button>
              <button
                type="button"
                onClick={() => setFrequencyType('custom')}
                className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  frequencyType === 'custom'
                    ? 'bg-[#17212B] border-[#4F7CFF] text-[#F1F5F9]'
                    : 'bg-[#111820] border-[#26313C] text-[#A8B3C2] hover:text-[#F1F5F9]'
                }`}
              >
                Custom Specific Days
              </button>
            </div>
          </div>

          {/* Custom Scheduled Days */}
          {frequencyType === 'custom' && (
            <div className="p-3 bg-[#17212B] rounded-lg border border-[#26313C] space-y-2">
              <label className="block text-xs font-medium text-[#A8B3C2]">
                Select Active Days of Week
              </label>
              <div className="flex gap-1.5 justify-between">
                {DAYS_OF_WEEK.map((day) => {
                  const selected = daysOfWeek.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`w-9 h-9 rounded-md font-medium text-xs flex items-center justify-center transition-colors ${
                        selected
                          ? 'bg-[#4F7CFF] text-white'
                          : 'bg-[#111820] text-[#718096] border border-[#26313C] hover:text-[#A8B3C2]'
                      }`}
                      aria-label={`Toggle ${day.label}`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              {fieldErrors.daysOfWeek && (
                <p className="text-xs text-[#F85149] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.daysOfWeek}</span>
                </p>
              )}
            </div>
          )}

          {/* Target Count & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="habit-target-count" className="block text-xs font-medium text-[#A8B3C2] mb-1">
                Target Quantity <span className="text-[#F85149]">*</span>
              </label>
              <input
                id="habit-target-count"
                type="number"
                min="1"
                value={targetCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setTargetCount(val);
                  if (val >= 1) setFieldErrors((prev) => ({ ...prev, targetCount: undefined }));
                }}
                className={`w-full saas-input ${
                  fieldErrors.targetCount ? 'border-[#F85149]' : ''
                }`}
                aria-invalid={!!fieldErrors.targetCount}
              />
              {fieldErrors.targetCount && (
                <p className="text-xs text-[#F85149] mt-1">{fieldErrors.targetCount}</p>
              )}
            </div>

            <div>
              <label htmlFor="habit-target-unit" className="block text-xs font-medium text-[#A8B3C2] mb-1">
                Unit
              </label>
              <input
                id="habit-target-unit"
                type="text"
                placeholder="times, liters, pages"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full saas-input"
              />
            </div>
          </div>

          {/* Color Accent Picker */}
          <div>
            <label className="block text-xs font-medium text-[#A8B3C2] mb-2">
              Card Color Accent
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                    color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111820] scale-105' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select accent color ${c}`}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-4 border-t border-[#26313C]">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto saas-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto saas-button-primary"
            >
              {loading ? (
                <span>Saving Routine...</span>
              ) : editingHabit ? (
                <span>Update Habit</span>
              ) : (
                <span>Create Habit</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
