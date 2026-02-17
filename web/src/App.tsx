import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';
import CalendarPage from './pages/CalendarPage';
import DiscoverPage from './pages/DiscoverPage';
import TeamsPage from './pages/TeamsPage';
import ScoresPage from './pages/ScoresPage';
import SettingsPage from './pages/SettingsPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './contexts/AuthContext';
import { runSupabaseReadDiagnostics } from './diagnostics/supabaseReadDiagnostics';
import './App.css';

type DiagnosticWindow = Window & {
  __scalendar_supabase_diag_ran__?: boolean;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 3400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV || isLoading) return;
    const diagnosticWindow = window as DiagnosticWindow;
    if (diagnosticWindow.__scalendar_supabase_diag_ran__) return;
    diagnosticWindow.__scalendar_supabase_diag_ran__ = true;

    const roleLabel = user ? 'authenticated' : 'anon';
    void runSupabaseReadDiagnostics(roleLabel).catch((error: unknown) => {
      console.warn('[Scalendar DIAG] Failed to run diagnostics:', error);
    });
  }, [isLoading, user]);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/teams"
          element={(
            <ProtectedRoute>
              <TeamsPage />
            </ProtectedRoute>
          )}
        />
        <Route element={<Layout />}>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/tables" element={<ScoresPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route
            path="/settings/account"
            element={(
              <ProtectedRoute>
                <AccountSettingsPage />
              </ProtectedRoute>
            )}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
