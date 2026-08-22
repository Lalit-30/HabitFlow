import React, { useState, useEffect } from 'react';
import { Shield, LogOut, Award, Edit3, Save, MapPin, Activity, Heart, Key, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, parseApiError } from '../services/api';

export const ProfileView: React.FC = () => {
  const { user, logout, refetchUser } = useAuth();
  const { showToast } = useToast();

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
      showToast('Profile updated successfully!', 'success');
      setEditing(false);
    } catch (err: any) {
      const errMsg = parseApiError(err, 'Failed to update profile.');
      setError(errMsg);
      showToast(errMsg, 'error');
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
      showToast('Account password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (err: any) {
      const errMsg = parseApiError(err, 'Failed to reset password. Please verify your current password.');
      setPwdError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-pageEnter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26313C] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#F1F5F9] tracking-tight">User Profile & Account Security</h1>
          <p className="text-xs sm:text-sm text-[#A8B3C2] mt-0.5">Personalized data, security parameters, and health stats</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="saas-button-secondary"
          >
            <Key className="w-4 h-4 text-[#D29922]" />
            <span>{showPasswordSection ? 'Hide Reset Password' : 'Reset Password'}</span>
          </button>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="saas-button-primary"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setEditing(false)}
              className="saas-button-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="p-3 bg-[#3FB950]/10 border border-[#3FB950]/30 text-[#3FB950] rounded-lg text-xs font-medium">
          {message}
        </div>
      )}
      {error && (
        <div className="p-3 bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] rounded-lg text-xs font-medium">
          {error}
        </div>
      )}
      {pwdMessage && (
        <div className="p-3 bg-[#3FB950]/10 border border-[#3FB950]/30 text-[#3FB950] rounded-lg text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {pwdMessage}
        </div>
      )}

      {/* PASSWORD RESET SECTION */}
      {showPasswordSection && (
        <form onSubmit={handlePasswordReset} className="saas-panel p-5 border border-[#D29922]/30 space-y-4">
          <div className="flex items-center gap-2 text-[#D29922] font-semibold text-sm border-b border-[#26313C] pb-2.5">
            <Lock className="w-4 h-4" />
            <span>Reset Account Password</span>
          </div>

          {pwdError && (
            <div className="p-3 bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] rounded-lg text-xs font-medium">
              {pwdError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full saas-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8B3C2] mb-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full saas-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8B3C2] mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full saas-input"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowPasswordSection(false)}
              className="saas-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pwdLoading}
              className="saas-button-primary"
            >
              {pwdLoading ? 'Resetting...' : 'Update Password'}
            </button>
          </div>
        </form>
      )}

      {/* Main Profile Card Header */}
      <div className="saas-panel p-6 border border-[#26313C] space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-b border-[#26313C] pb-5">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.full_name}
                  loading="lazy"
                  decoding="async"
                  className="w-16 h-16 rounded-lg object-cover border border-[#26313C]"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-[#17212B] border border-[#26313C] flex items-center justify-center text-[#4F7CFF] text-2xl font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-[#F1F5F9]">{user?.full_name}</h2>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#17212B] text-[#4F7CFF] border border-[#26313C]">
                  {user?.user_code}
                </span>
              </div>
              <p className="text-xs text-[#A8B3C2] mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-[#718096]">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#718096]" /> {user?.city || 'City'}, {user?.country || 'Country'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="saas-button-danger"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Level Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="saas-card p-4 space-y-1 border border-[#26313C]">
            <div className="flex items-center gap-2 text-[#D29922]">
              <span className="text-xs font-medium uppercase tracking-wider">Level</span>
            </div>
            <p className="text-xl font-bold text-[#F1F5F9] font-mono">Level {user?.level}</p>
          </div>

          <div className="saas-card p-4 space-y-1 border border-[#26313C]">
            <div className="flex items-center gap-2 text-[#4F7CFF]">
              <Award className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">XP Points</span>
            </div>
            <p className="text-xl font-bold text-[#F1F5F9] font-mono">{user?.xp} XP</p>
          </div>

          <div className="saas-card p-4 space-y-1 border border-[#26313C]">
            <div className="flex items-center gap-2 text-[#3FB950]">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">User Code</span>
            </div>
            <p className="text-xl font-bold text-[#3FB950] font-mono">{user?.user_code}</p>
          </div>
        </div>
      </div>

      {/* Editable Details Form */}
      <form onSubmit={handleSave} className="saas-panel p-6 border border-[#26313C] space-y-5">
        <h3 className="text-base font-semibold text-[#F1F5F9] border-b border-[#26313C] pb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#4F7CFF]" />
          <span>Health Parameters & Personal Info</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#A8B3C2] mb-1">
              Full Name
            </label>
            <input
              type="text"
              disabled={!editing}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full saas-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A8B3C2] mb-1">
              Profile Picture URL
            </label>
            <input
              type="text"
              disabled={!editing}
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full saas-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A8B3C2] mb-1">
              Age (Years)
            </label>
            <input
              type="number"
              disabled={!editing}
              placeholder="e.g. 24"
              value={age}
              onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full saas-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A8B3C2] mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              disabled={!editing}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full saas-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A8B3C2] mb-1">
              Gender
            </label>
            <select
              disabled={!editing}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full saas-input cursor-pointer"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A8B3C2] mb-1">
              City / Place
            </label>
            <input
              type="text"
              disabled={!editing}
              placeholder="e.g. San Francisco"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full saas-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A8B3C2] mb-1">
              Country
            </label>
            <input
              type="text"
              disabled={!editing}
              placeholder="e.g. United States"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full saas-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A8B3C2] mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                disabled={!editing}
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full saas-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A8B3C2] mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                disabled={!editing}
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full saas-input"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#A8B3C2] mb-1 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#F85149]" /> Primary Health & Habit Target
          </label>
          <input
            type="text"
            disabled={!editing}
            placeholder="e.g. Build core strength, stay hydrated, sleep by 11 PM"
            value={healthGoal}
            onChange={(e) => setHealthGoal(e.target.value)}
            className="w-full saas-input"
          />
        </div>

        {editing && (
          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#26313C]">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="saas-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="saas-button-primary"
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

export default ProfileView;
