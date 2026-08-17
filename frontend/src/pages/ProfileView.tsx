import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Shield, Calendar, LogOut, Zap, Award, Edit3, Save, Camera, MapPin, Activity, Heart, Key, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProfileView: React.FC = () => {
  const { user, logout, refetchUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [healthGoal, setHealthGoal] = useState('');

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password reset state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState('');
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setAvatarUrl(user.avatar_url || '');
      setAge(user.age || '');
      setDob(user.dob || '');
      setGender(user.gender || '');
      setCity(user.city || '');
      setCountry(user.country || '');
      setHeight(user.height || '');
      setWeight(user.weight || '');
      setHealthGoal(user.health_goal || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.put('/auth/profile', {
        full_name: fullName.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        age: age ? Number(age) : undefined,
        dob: dob || undefined,
        gender: gender || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        health_goal: healthGoal.trim() || undefined,
      });

      await refetchUser();
      setMessage('Profile updated successfully!');
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdMessage('');
    setPwdError('');

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match. Please re-enter.');
      setPwdLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters.');
      setPwdLoading(false);
      return;
    }

    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });

      setPwdMessage('Password successfully reset and updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (err: any) {
      setPwdError(err.response?.data?.detail || 'Failed to reset password. Please verify your current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Profile & Account Security</h1>
          <p className="text-sm text-slate-400">Personalized data, security parameters, and health stats</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>{showPasswordSection ? 'Hide Reset Password' : 'Reset Password'}</span>
          </button>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md transition-all"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm border border-slate-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium">
          {message}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      {pwdMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> {pwdMessage}
        </div>
      )}

      {/* PASSWORD RESET SECTION */}
      {showPasswordSection && (
        <form onSubmit={handlePasswordReset} className="glass-panel p-6 border border-amber-500/30 bg-slate-900/90 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 font-bold border-b border-slate-800 pb-3">
            <Lock className="w-5 h-5" />
            <span>Reset Account Password</span>
          </div>

          {pwdError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-medium">
              {pwdError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPasswordSection(false)}
              className="px-4 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pwdLoading}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-600/30 transition disabled:opacity-50"
            >
              {pwdLoading ? 'Resetting...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}

      {/* Main Profile Card Header */}
      <div className="glass-panel p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.full_name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-brand-500 shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{user?.full_name}</h2>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40">
                  {user?.user_code}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {user?.city || 'City'}, {user?.country || 'Country'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-sm border border-rose-500/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Level Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 space-y-1 border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400">
              <Zap className="w-4 h-4 fill-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Level</span>
            </div>
            <p className="text-2xl font-black text-white font-mono">Level {user?.level}</p>
          </div>

          <div className="glass-card p-5 space-y-1 border border-slate-800">
            <div className="flex items-center gap-2 text-brand-400">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">XP Points</span>
            </div>
            <p className="text-2xl font-black text-white font-mono">{user?.xp} XP</p>
          </div>

          <div className="glass-card p-5 space-y-1 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Unique User Code</span>
            </div>
            <p className="text-2xl font-black text-emerald-300 font-mono">{user?.user_code}</p>
          </div>
        </div>
      </div>

      {/* Editable Details Form */}
      <form onSubmit={handleSave} className="glass-panel p-8 border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-400" />
          <span>Health Parameters & Personal Info</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              disabled={!editing}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-60 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Profile Picture URL
            </label>
            <input
              type="text"
              disabled={!editing}
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-60 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Age (Years)
            </label>
            <input
              type="number"
              disabled={!editing}
              placeholder="e.g. 24"
              value={age}
              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-60 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              disabled={!editing}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-60 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Gender
            </label>
            <select
              disabled={!editing}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-60 text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              City / Place
            </label>
            <input
              type="text"
              disabled={!editing}
              placeholder="e.g. San Francisco"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-60 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Country
            </label>
            <input
              type="text"
              disabled={!editing}
              placeholder="e.g. United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-60 text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                disabled={!editing}
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-60 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                disabled={!editing}
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-60 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-400" /> Primary Health & Habit Target
          </label>
          <input
            type="text"
            disabled={!editing}
            placeholder="e.g. Build core strength, stay hydrated, sleep by 11 PM"
            value={healthGoal}
            onChange={(e) => setHealthGoal(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white disabled:opacity-60 text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        {editing && (
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
