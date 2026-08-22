import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Mail, 
  Lock, 
  ArrowRight, 
  KeyRound, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Activity, 
  BarChart3,
  Check
} from 'lucide-react';
import { api, parseApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password
      });
      await login(response.data.access_token);
      navigate('/');
    } catch (err: any) {
      console.error("Login error:", err);
      setError(parseApiError(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    const demoEmail = 'demo@habitflow.app';
    const demoPassword = 'Password123!';

    try {
      const response = await api.post('/auth/login', {
        email: demoEmail,
        password: demoPassword
      });
      await login(response.data.access_token);
      navigate('/');
    } catch {
      try {
        await api.post('/auth/register', {
          email: demoEmail,
          password: demoPassword,
          full_name: 'Demo User'
        });
        const loginRes = await api.post('/auth/login', {
          email: demoEmail,
          password: demoPassword
        });
        await login(loginRes.data.access_token);
        navigate('/');
      } catch (regErr: any) {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setError(parseApiError(regErr, 'Could not auto-login to demo account. Credentials pre-filled below.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotSuccess('');
    setForgotError('');

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      setForgotLoading(false);
      return;
    }

    if (forgotNewPassword.length < 4) {
      setForgotError('New password must be at least 4 characters.');
      setForgotLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/forgot-password', {
        email: forgotEmail.trim(),
        new_password: forgotNewPassword
      });

      setForgotSuccess(res.data.message || 'Password reset successfully!');
      setEmail(forgotEmail.trim());
      setPassword('');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess('');
      }, 2500);
    } catch (err: any) {
      setForgotError(parseApiError(err, 'Failed to reset password. Please check your email.'));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#F1F5F9] flex flex-col justify-between relative overflow-hidden">
      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between relative z-10 border-b border-[#26313C]/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#4F7CFF] flex items-center justify-center text-white">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-[#F1F5F9]">HabitFlow</span>
            <span className="hidden sm:inline-block text-xs text-[#718096] ml-2 font-medium">Daily Routine Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#718096] hidden sm:inline-block">New to HabitFlow?</span>
          <Link
            to="/register"
            className="saas-button-secondary"
          >
            Create Free Account
          </Link>
        </div>
      </header>

      {/* Main SaaS Split Grid Layout */}
      <main className="w-full max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 my-auto">
        {/* LEFT COLUMN: VALUE PROPOSITION & PRODUCT SHOWCASE */}
        <div className="lg:col-span-7 space-y-6 animate-pageEnter">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F7CFF]/10 border border-[#4F7CFF]/20 text-[#4F7CFF] text-xs font-medium">
              <Zap className="w-3.5 h-3.5 text-[#4F7CFF]" />
              <span>Data-Driven Personal Consistency</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F1F5F9] tracking-tight leading-[1.15]">
              Build daily habits that <span className="text-[#4F7CFF]">actually stick.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#A8B3C2] max-w-xl leading-relaxed font-normal">
              HabitFlow gives professionals and goal-driven individuals a zero-friction system to track daily routines, measure completion consistency, and analyze long-term progress.
            </p>
          </div>

          {/* Interactive Live Product Preview Card */}
          <div className="saas-panel p-5 border border-[#26313C] space-y-4 max-w-lg">
            <div className="flex items-center justify-between border-b border-[#26313C] pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#3FB950]/10 border border-[#3FB950]/20 text-[#3FB950] flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-[#F1F5F9]">Today's Execution Rate</h3>
                  <p className="text-[11px] text-[#718096]">4 of 5 daily habits completed</p>
                </div>
              </div>
              <span className="text-sm font-bold text-[#3FB950] font-mono">80%</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#17212B] p-3 rounded-lg border border-[#26313C]">
                <p className="text-[11px] text-[#718096] font-medium">Active Streak</p>
                <p className="text-sm font-bold text-[#D29922] flex items-center gap-1.5 mt-0.5 font-mono">
                  <Flame className="w-3.5 h-3.5 fill-[#D29922]" /> 14 Days
                </p>
              </div>

              <div className="bg-[#17212B] p-3 rounded-lg border border-[#26313C]">
                <p className="text-[11px] text-[#718096] font-medium">Monthly Consistency</p>
                <p className="text-sm font-bold text-[#4F7CFF] flex items-center gap-1.5 mt-0.5 font-mono">
                  <BarChart3 className="w-3.5 h-3.5 text-[#4F7CFF]" /> 92% Consistency
                </p>
              </div>
            </div>

            {/* Simulated Habit Check Row */}
            <div className="p-2.5 bg-[#17212B] rounded-lg border border-[#26313C] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-[#3FB950] text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs font-medium text-[#F1F5F9]">Morning Deep Work (90 Mins)</span>
              </div>
              <span className="text-[10px] text-[#718096] font-mono">+25 XP</span>
            </div>
          </div>

          {/* Product Quality Trust Signals (Authentic Features) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 max-w-xl text-xs text-[#718096]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4F7CFF] shrink-0" />
              <span>JWT Encrypted Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#3FB950] shrink-0" />
              <span>Fast FastAPI Backend</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D29922] shrink-0" />
              <span>Offline Resilience</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTHENTICATION FORM */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto animate-pageEnter">
          <div className="saas-panel p-6 border border-[#26313C] space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#F1F5F9] tracking-tight">Sign in to HabitFlow</h2>
              <p className="text-xs text-[#A8B3C2] mt-0.5">Enter your credentials below to access your dashboard</p>
            </div>

            {error && (
              <div className="p-3 bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-medium text-[#A8B3C2] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full saas-input pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="block text-xs font-medium text-[#A8B3C2]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotError('');
                      setForgotSuccess('');
                      setShowForgotModal(true);
                    }}
                    className="text-xs text-[#4F7CFF] hover:text-[#4169E1] font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full saas-input pl-9"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full saas-button-primary"
              >
                {loading ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative py-1 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#26313C]" />
              </div>
              <span className="relative px-2 bg-[#111820] text-[10px] text-[#718096] uppercase tracking-wider font-semibold">
                Instant Evaluation
              </span>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full saas-button-secondary"
            >
              <Zap className="w-4 h-4 text-[#D29922]" />
              <span>Try Instant Demo Account</span>
            </button>

            <p className="text-center text-xs text-[#A8B3C2] pt-1">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#4F7CFF] hover:underline">
                Create Free Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-[#718096] relative z-10 border-t border-[#26313C]/40">
        <p>HabitFlow • High-Performance Personal Habit System</p>
      </footer>

      {/* FORGOT / RESET PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F14]/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#111820] border border-[#26313C] w-full max-w-md p-5 rounded-xl shadow-xl relative animate-modalEnter">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1 text-[#718096] hover:text-[#F1F5F9] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3 text-[#4F7CFF]">
              <KeyRound className="w-5 h-5" />
              <h3 className="text-base font-semibold text-[#F1F5F9]">Reset Account Password</h3>
            </div>

            <p className="text-xs text-[#A8B3C2] mb-4">
              Enter your account email and choose a new password to reset access immediately.
            </p>

            {forgotSuccess && (
              <div className="mb-4 p-3 bg-[#3FB950]/10 border border-[#3FB950]/30 text-[#3FB950] rounded-lg text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div className="mb-4 p-3 bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] rounded-lg text-xs font-medium">
                {forgotError}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#A8B3C2] mb-1">
                  Account Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full saas-input"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A8B3C2] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  placeholder="At least 4 characters"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  className="w-full saas-input"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A8B3C2] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={4}
                  placeholder="Re-enter new password"
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  className="w-full saas-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#26313C]">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="saas-button-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="saas-button-primary"
                >
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
