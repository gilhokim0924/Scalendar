import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CalendarPage from './pages/CalendarPage';
import DiscoverPage from './pages/DiscoverPage';
import TeamsPage from './pages/TeamsPage';
import ScoresPage from './pages/ScoresPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/teams" element={<TeamsPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/scores" element={<ScoresPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
