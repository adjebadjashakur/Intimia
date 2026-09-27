import { lazy, Suspense, Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

const Layout = lazy(() => import('./components/layout/Layout'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/journal/DashboardPage'));
const JournalWritePage = lazy(() => import('./pages/journal/JournalWritePage'));
const PlanningPage = lazy(() => import('./pages/journal/PlanningPage'));
const RoutinePage = lazy(() => import('./pages/journal/RoutinePage'));
const MoodsPage = lazy(() => import('./pages/journal/MoodsPage'));
const GalleryPage = lazy(() => import('./pages/journal/GalleryPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const AvatarsPage = lazy(() => import('./pages/settings/AvatarsPage'));

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-soft-lg border border-gray-100 p-8 text-center animate-scale-in">
            <div className="h-16 w-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">Une erreur est survenue</h2>
            <p className="text-sm text-gray-500 mb-6">
              {this.state.error?.message || "L'application a rencontré un problème."}
            </p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-rose-500 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-rose-500 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<PublicRoute><WelcomePage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {[
            ['/dashboard', DashboardPage],
            ['/journal/write', JournalWritePage],
            ['/journal/planning', PlanningPage],
            ['/journal/routine', RoutinePage],
            ['/journal/moods', MoodsPage],
            ['/journal/gallery', GalleryPage],
            ['/settings', SettingsPage],
            ['/settings/avatar', AvatarsPage],
          ].map(([path, Component]) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute>
                  <Layout><Component /></Layout>
                </ProtectedRoute>
              }
            />
          ))}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
