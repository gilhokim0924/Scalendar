import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="bottom-navigation">
      <div className="bottom-navigation-inner">
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
      <Link to="/scores" className={`nav-tab ${location.pathname === '/scores' ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 6 9 6 9Z" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5C17 4 18 9 18 9Z" />
          <path d="M4 22h16" />
          <path d="M10 22V16a2 2 0 0 0-2-2H6" />
          <path d="M14 22V16a2 2 0 0 1 2-2h2" />
          <path d="M6 9a6 6 0 0 0 12 0V4H6Z" />
        </svg>
        <span>Scores</span>
      </Link>
      <Link to="/settings" className={`nav-tab ${location.pathname === '/settings' ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>Settings</span>
      </Link>
      </div>
    </nav>
  );
}
