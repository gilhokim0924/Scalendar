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
import LoginPage from './pages/LoginPage';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 3400);
    return () => window.clearTimeout(timer);
  }, []);

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
        <Route
          element={(
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          )}
        >
          <Route path="/" element={<CalendarPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/tables" element={<ScoresPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
