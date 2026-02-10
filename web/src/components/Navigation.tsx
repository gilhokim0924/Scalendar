import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="top-navigation">
      <Link
        to="/"
        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
      >
        Calendar
      </Link>
      <Link
        to="/teams"
        className={`nav-link ${location.pathname === '/teams' ? 'active' : ''}`}
      >
        My Teams
      </Link>
      <Link
        to="/settings"
        className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
      >
        Settings
      </Link>
    </nav>
  );
}
