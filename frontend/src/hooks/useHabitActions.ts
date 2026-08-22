import { useState } from 'react';
import { api, parseApiError } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Habit } from '../types';

export const useHabitActions = (onStateChanged?: () => void) => {
  const { showToast } = useToast();
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [pendingHabitIds, setPendingHabitIds] = useState<Set<string>>(new Set());

  const toggleComplete = async (
    habitId: string, 
    currentlyCompleted: boolean,
    onOptimisticUpdate?: (newCompletedState: boolean) => void,
    onRollback?: () => void
  ) => {
    // Prevent duplicate action trigger if a request for this habit is already in-flight
    if (pendingHabitIds.has(habitId)) return;

    setPendingHabitIds((prev) => new Set(prev).add(habitId));

    // 1. Optimistic UI callback
    if (onOptimisticUpdate) {
      onOptimisticUpdate(!currentlyCompleted);
    }

    if (currentlyCompleted) {
      showToast('Habit status marked incomplete.', 'info');
    } else {
      showToast('Habit completed! Streak maintained! 🔥', 'success');
    }

    // 2. Async API Call
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      if (currentlyCompleted) {
        await api.delete(`/habits/${habitId}/complete/${todayStr}`);
      } else {
        await api.post(`/habits/${habitId}/complete`, {
          completed_date: todayStr,
          status: 'completed',
        });
      }
    } catch (err: any) {
      console.error('Failed to toggle habit completion:', err);
      if (onRollback) onRollback();

      const is404 = err?.response?.status === 404;
      const errorMsg = is404
        ? 'Habit no longer exists or was deleted on server. Reverting state.'
        : parseApiError(err, 'Server error saving completion. Reverted changes.');

      showToast(errorMsg, 'error');

      // Refresh list to sync with actual backend state on 404
      if (is404 && onStateChanged) {
        onStateChanged();
      }
    } finally {
      setPendingHabitIds((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }
  };

  const archiveHabit = async (habitId: string, isCurrentlyArchived: boolean) => {
    setActionLoading(true);
    try {
      if (isCurrentlyArchived) {
        await api.patch(`/habits/${habitId}/restore`);
        showToast('Habit restored successfully.', 'success');
      } else {
        await api.patch(`/habits/${habitId}/archive`);
        showToast('Habit moved to archives.', 'info');
      }
      if (onStateChanged) onStateChanged();
    } catch (err: any) {
      console.error('Failed to archive/restore habit:', err);
      showToast(parseApiError(err, 'Failed to change habit archive status.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteHabit = async (habit: Habit) => {
    setActionLoading(true);
    try {
      await api.delete(`/habits/${habit.id}`);
      showToast(`Habit "${habit.name}" permanently deleted.`, 'info');
      if (onStateChanged) onStateChanged();
    } catch (err: any) {
      console.error('Failed to delete habit:', err);
      showToast(parseApiError(err, 'Failed to delete habit.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    toggleComplete,
    archiveHabit,
    deleteHabit,
    actionLoading,
    pendingHabitIds,
  };
};
