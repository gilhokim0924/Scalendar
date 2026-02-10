import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="bottom-navigation">
      <Link to="/" className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="9" y1="4" x2="9" y2="10" />
          <line x1="15" y1="4" x2="15" y2="10" />
        </svg>
        <span>Calendar</span>
      </Link>
      <Link to="/discover" className={`nav-tab ${location.pathname === '/discover' ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" />
        </svg>
        <span>Discover</span>
      </Link>
      <Link to="/teams" className={`nav-tab ${location.pathname === '/teams' ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Teams</span>
      </Link>
      <Link to="/settings" className={`nav-tab ${location.pathname === '/settings' ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>Settings</span>
      </Link>
    </nav>
  );
}
