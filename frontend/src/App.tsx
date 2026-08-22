import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';

// Lazy-loaded page components for route-level code splitting
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const MyHabits = lazy(() => import('./pages/MyHabits').then(m => ({ default: m.MyHabits })));
const CalendarView = lazy(() => import('./pages/CalendarView').then(m => ({ default: m.CalendarView })));
const AnalyticsView = lazy(() => import('./pages/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const AchievementsView = lazy(() => import('./pages/AchievementsView').then(m => ({ default: m.AchievementsView })));
const ProfileView = lazy(() => import('./pages/ProfileView').then(m => ({ default: m.ProfileView })));
const AdminView = lazy(() => import('./pages/AdminView').then(m => ({ default: m.AdminView })));
const NotFoundView = lazy(() => import('./pages/NotFoundView').then(m => ({ default: m.NotFoundView })));

const PageFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[50vh]" aria-label="Loading page content">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#4F7CFF]" />
  </div>
);

const ProtectedLayout: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center" aria-label="Loading authentication">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#4F7CFF]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0B0F14] text-[#F1F5F9] selection:bg-[#4F7CFF]/30 selection:text-white relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto pb-12">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
        
        {/* Footer Attribution */}
        <footer className="px-4 py-3 border-t border-[#26313C]/40 text-center md:text-right max-w-7xl w-full mx-auto shrink-0">
          <span className="text-[10px] font-mono tracking-wider text-[#718096] uppercase">
            HANDCRAFTED WITH ♥ BY LALIT SIRVI
          </span>
        </footer>
      </div>
    </div>
  );
};

const ProtectedAdminRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-500" />
      </div>
    );
  }

  const isAdmin = !!user?.is_admin;

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminView />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/habits" element={<MyHabits />} />
                  <Route path="/calendar" element={<CalendarView />} />
                  <Route path="/analytics" element={<AnalyticsView />} />
                  <Route path="/achievements" element={<AchievementsView />} />
                  <Route path="/profile" element={<ProfileView />} />
                  <Route path="/admin" element={<ProtectedAdminRoute />} />
                  <Route path="/404" element={<NotFoundView />} />
                  <Route path="*" element={<NotFoundView />} />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
