import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Trophy, 
  TrendingUp,
  Target
} from 'lucide-react';
import { api, parseApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Register user account
      await api.post('/auth/register', {
        email: email.trim(),
        password,
        full_name: fullName.trim(),
      });

      // 2. Auto login after successful registration
      const loginRes = await api.post('/auth/login', {
        email: email.trim(),
        password
      });

      if (loginRes.data?.access_token) {
        await login(loginRes.data.access_token);
        navigate('/');
      } else {
        throw new Error("Login failed after registration");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(parseApiError(err, 'Registration failed. Please check your information and try again.'));
    } finally {
      setLoading(false);
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
          <span className="text-xs text-[#718096] hidden sm:inline-block">Already registered?</span>
          <Link
            to="/login"
            className="saas-button-secondary"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main SaaS Split Grid Layout */}
      <main className="w-full max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 my-auto">
        {/* LEFT COLUMN: VALUE PROPOSITION & PRODUCT SHOWCASE */}
        <div className="lg:col-span-7 space-y-6 animate-pageEnter">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3FB950]/10 border border-[#3FB950]/20 text-[#3FB950] text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Free Account • No Credit Card Required</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F1F5F9] tracking-tight leading-[1.15]">
              Start tracking habits with <span className="text-[#3FB950]">zero overhead.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#A8B3C2] max-w-xl leading-relaxed font-normal">
              Create your account in seconds to unlock personalized daily targets, automatic streak calculations, monthly heatmaps, and Level/XP gamification.
            </p>
          </div>

          {/* Feature Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg">
            <div className="saas-panel p-4 border border-[#26313C] space-y-1.5">
              <div className="w-7 h-7 rounded bg-[#4F7CFF]/10 border border-[#4F7CFF]/20 text-[#4F7CFF] flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-[#F1F5F9]">Daily Target Tracking</h3>
              <p className="text-[11px] text-[#718096]">Set customized frequencies and category tags for your daily routines.</p>
            </div>

            <div className="saas-panel p-4 border border-[#26313C] space-y-1.5">
              <div className="w-7 h-7 rounded bg-[#3FB950]/10 border border-[#3FB950]/20 text-[#3FB950] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-[#F1F5F9]">Analytics Heatmaps</h3>
              <p className="text-[11px] text-[#718096]">Visualize monthly execution rates and 7-day consistency scores.</p>
            </div>

            <div className="saas-panel p-4 border border-[#26313C] space-y-1.5">
              <div className="w-7 h-7 rounded bg-[#D29922]/10 border border-[#D29922]/20 text-[#D29922] flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-[#F1F5F9]">XP & Milestone Levels</h3>
              <p className="text-[11px] text-[#718096]">Earn XP on completion and unlock badges as your streak grows.</p>
            </div>

            <div className="saas-panel p-4 border border-[#26313C] space-y-1.5">
              <div className="w-7 h-7 rounded bg-[#3FB950]/10 border border-[#3FB950]/20 text-[#3FB950] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-semibold text-[#F1F5F9]">Private & Resilient</h3>
              <p className="text-[11px] text-[#718096]">Your data stays safe with encrypted JWT auth and resilient state rollback.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTRATION FORM */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto animate-pageEnter">
          <div className="saas-panel p-6 border border-[#26313C] space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#F1F5F9] tracking-tight">Create Free Account</h2>
              <p className="text-xs text-[#A8B3C2] mt-0.5">Get started building long-term habits today</p>
            </div>

            {error && (
              <div className="p-3 bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] rounded-lg text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg-fullname" className="block text-xs font-medium text-[#A8B3C2] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
                  <input
                    id="reg-fullname"
                    type="text"
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full saas-input pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-medium text-[#A8B3C2] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
                  <input
                    id="reg-email"
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
                <label htmlFor="reg-password" className="block text-xs font-medium text-[#A8B3C2] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#718096]" />
                  <input
                    id="reg-password"
                    type="password"
                    placeholder="At least 4 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full saas-input pl-9"
                    minLength={4}
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
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-[#A8B3C2] pt-1">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#4F7CFF] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-[#718096] relative z-10 border-t border-[#26313C]/40">
        <p>HabitFlow • High-Performance Personal Habit System</p>
      </footer>
    </div>
  );
};

export default Register;
