import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Activity, 
  CheckCircle2, 
  XCircle,
  Flame,
  Award,
  X
} from 'lucide-react';
import { api, parseApiError } from '../services/api';
import { User } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminView: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form inputs for Add User
  const [addForm, setAddForm] = useState({
    email: '',
    password: '',
    full_name: '',
    height: '',
    weight: '',
    health_goal: ''
  });

  // Form inputs for Edit User
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    level: 1,
    xp: 0,
    city: '',
    country: '',
    height: '',
    weight: '',
    health_goal: '',
    is_active: true
  });

  const fetchUsers = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error("Failed to fetch admin users:", err);
      setError(parseApiError(err, "Failed to load admin user data."));
    } finally {
      setLoading(false);
      if (isManualRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Add User submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', {
        email: addForm.email,
        password: addForm.password,
        full_name: addForm.full_name,
        height: addForm.height ? parseFloat(addForm.height) : undefined,
        weight: addForm.weight ? parseFloat(addForm.weight) : undefined,
        health_goal: addForm.health_goal || undefined
      });
      setShowAddModal(false);
      setAddForm({ email: '', password: '', full_name: '', height: '', weight: '', health_goal: '' });
      showToast('User account created successfully.', 'success');
      fetchUsers(true);
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to add user.", 'error');
    }
  };

  // Handle Edit User Submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        full_name: editForm.full_name,
        email: editForm.email,
        level: Number(editForm.level),
        xp: Number(editForm.xp),
        city: editForm.city || undefined,
        country: editForm.country || undefined,
        height: editForm.height ? parseFloat(editForm.height) : undefined,
        weight: editForm.weight ? parseFloat(editForm.weight) : undefined,
        health_goal: editForm.health_goal || undefined,
        is_active: editForm.is_active
      });
      setEditingUser(null);
      showToast('User profile updated successfully.', 'success');
      fetchUsers(true);
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to update user.", 'error');
    }
  };

  // Handle Delete User
  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await api.delete(`/admin/users/${deletingUser.id}`);
      setDeletingUser(null);
      showToast('User account deleted.', 'info');
      fetchUsers(true);
    } catch (err: any) {
      showToast(err.response?.data?.detail || "Failed to delete user.", 'error');
    }
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditForm({
      full_name: u.full_name || '',
      email: u.email || '',
      level: u.level || 1,
      xp: u.xp || 0,
      city: u.city || '',
      country: u.country || '',
      height: u.height ? String(u.height) : '',
      weight: u.weight ? String(u.weight) : '',
      health_goal: u.health_goal || '',
      is_active: u.is_active ?? true
    });
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.user_code && u.user_code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-pageEnter">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#26313C] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#4F7CFF]/15 text-[#4F7CFF] border border-[#4F7CFF]/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Access
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">Admin Control Center</h1>
          <p className="text-xs sm:text-sm text-[#A8B3C2] mt-0.5">
            User management and app statistics ({users.length} Total Users)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchUsers(true)}
            disabled={isRefreshing}
            className="saas-button-secondary"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="saas-button-primary"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-[#4F7CFF]/10 text-[#4F7CFF] border border-[#4F7CFF]/20 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#718096] font-medium">Active App Users</p>
            <h3 className="text-xl font-bold text-[#F1F5F9] font-mono">{users.filter(u => u.is_active).length}</h3>
          </div>
        </div>

        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-[#D29922]/10 text-[#D29922] border border-[#D29922]/20 rounded-lg">
            <Flame className="w-5 h-5 fill-[#D29922]" />
          </div>
          <div>
            <p className="text-xs text-[#718096] font-medium">Total Tracked Habits</p>
            <h3 className="text-xl font-bold text-[#F1F5F9] font-mono">
              {users.reduce((acc, u) => acc + (u.habits_count || 0), 0)}
            </h3>
          </div>
        </div>

        <div className="saas-card p-4 flex items-center gap-3">
          <div className="p-2.5 bg-[#3FB950]/10 text-[#3FB950] border border-[#3FB950]/20 rounded-lg">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[#718096] font-medium">Total Completions</p>
            <h3 className="text-xl font-bold text-[#F1F5F9] font-mono">
              {users.reduce((acc, u) => acc + (u.completions_count || 0), 0)}
            </h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="saas-panel p-3.5 flex items-center gap-3 border border-[#26313C]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#718096] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, or user code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full saas-input pl-9 pr-3 py-1.5 text-xs"
          />
        </div>
        <div className="text-[11px] text-[#718096] font-mono hidden sm:block">
          Synced {lastRefreshed.toLocaleTimeString()}
        </div>
      </div>

      {/* Users Data Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4F7CFF] mx-auto mb-3" />
          <p className="text-[#718096] text-xs">Loading user database...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] rounded-lg text-center text-xs font-medium">
          {error}
        </div>
      ) : (
        <div className="saas-panel border border-[#26313C] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#26313C] bg-[#111820] text-[#718096] text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-3">Level & XP</th>
                  <th className="py-3 px-3">Habits & Logs</th>
                  <th className="py-3 px-3">Stats</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26313C] text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-[#718096]">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#17212B] transition-colors">
                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#17212B] border border-[#26313C] flex items-center justify-center font-bold text-[#4F7CFF] shrink-0">
                            {u.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-[#F1F5F9] flex items-center gap-1.5">
                              {u.full_name}
                              <span className="text-[10px] text-[#4F7CFF] font-mono">
                                {u.user_code || `#${u.id.substring(0, 6)}`}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#718096]">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Level & XP */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#D29922]" />
                          <span className="font-semibold text-[#F1F5F9]">Lvl {u.level}</span>
                          <span className="text-[11px] text-[#718096]">({u.xp} XP)</span>
                        </div>
                      </td>

                      {/* Habits & Activity */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-[#A8B3C2]">
                          <span className="font-semibold text-[#4F7CFF]">{u.habits_count || 0}</span> Habits
                        </div>
                        <div className="text-[11px] text-[#718096]">
                          <span className="font-semibold text-[#3FB950]">{u.completions_count || 0}</span> Logs
                        </div>
                      </td>

                      {/* Physical Stats */}
                      <td className="py-3 px-3 text-[11px] text-[#A8B3C2]">
                        {u.height || u.weight ? (
                          <div>
                            {u.height ? `${u.height} cm` : ''} {u.weight ? `| ${u.weight} kg` : ''}
                          </div>
                        ) : (
                          <span className="text-[#718096] font-normal">--</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#3FB950]/10 text-[#3FB950] border border-[#3FB950]/30">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#F85149]/10 text-[#F85149] border border-[#F85149]/30">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-3 text-[11px] text-[#718096] font-mono">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1 text-[#718096] hover:text-[#4F7CFF] rounded hover:bg-[#17212B] transition-colors"
                          title="Edit User Profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          className="p-1 text-[#718096] hover:text-[#F85149] rounded hover:bg-[#17212B] transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#0B0F14]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111820] border border-[#26313C] w-full max-w-md rounded-xl p-5 shadow-xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#718096] hover:text-[#F1F5F9]"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-base font-semibold text-[#F1F5F9] mb-4">Add New User Account</h2>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={addForm.full_name}
                  onChange={(e) => setAddForm({...addForm, full_name: e.target.value})}
                  className="w-full saas-input"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                  className="w-full saas-input"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={addForm.password}
                  onChange={(e) => setAddForm({...addForm, password: e.target.value})}
                  className="w-full saas-input"
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={addForm.height}
                    onChange={(e) => setAddForm({...addForm, height: e.target.value})}
                    className="w-full saas-input"
                    placeholder="175"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={addForm.weight}
                    onChange={(e) => setAddForm({...addForm, weight: e.target.value})}
                    className="w-full saas-input"
                    placeholder="70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Health Goal</label>
                <input
                  type="text"
                  value={addForm.health_goal}
                  onChange={(e) => setAddForm({...addForm, health_goal: e.target.value})}
                  className="w-full saas-input"
                  placeholder="e.g. Build muscle & 10k steps daily"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#26313C]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="saas-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="saas-button-primary"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-[#0B0F14]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111820] border border-[#26313C] w-full max-w-lg rounded-xl p-5 shadow-xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-[#718096] hover:text-[#F1F5F9]"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-base font-semibold text-[#F1F5F9] mb-4">Edit User Profile</h2>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    className="w-full saas-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full saas-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Level</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.level}
                    onChange={(e) => setEditForm({...editForm, level: Number(e.target.value)})}
                    className="w-full saas-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A8B3C2] mb-1">XP Points</label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.xp}
                    onChange={(e) => setEditForm({...editForm, xp: Number(e.target.value)})}
                    className="w-full saas-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={editForm.height}
                    onChange={(e) => setEditForm({...editForm, height: e.target.value})}
                    className="w-full saas-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={editForm.weight}
                    onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                    className="w-full saas-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Health Goal</label>
                <input
                  type="text"
                  value={editForm.health_goal}
                  onChange={(e) => setEditForm({...editForm, health_goal: e.target.value})}
                  className="w-full saas-input"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A8B3C2]">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                    className="rounded bg-[#17212B] border-[#26313C] text-[#4F7CFF] focus:ring-0"
                  />
                  <span>Account Active</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#26313C]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="saas-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="saas-button-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-[#0B0F14]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111820] border border-[#26313C] w-full max-w-sm rounded-xl p-5 shadow-xl text-center">
            <div className="w-10 h-10 rounded-lg bg-[#F85149]/10 text-[#F85149] flex items-center justify-center mx-auto mb-3 border border-[#F85149]/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-semibold text-[#F1F5F9] mb-1.5">Delete User Account?</h2>
            <p className="text-[#A8B3C2] text-xs mb-5">
              Are you sure you want to permanently delete <strong className="text-[#F1F5F9]">{deletingUser.full_name}</strong> ({deletingUser.email})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeletingUser(null)}
                className="saas-button-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="saas-button-danger"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
