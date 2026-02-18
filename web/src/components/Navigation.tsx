import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Navigation.css';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const scrollRootToTop = () => {
    const root = document.getElementById('root');
    root?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCalendarClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const todayEl = document.querySelector('.today-marker');
      todayEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      e.preventDefault();
      navigate('/');
      setTimeout(() => {
        const todayEl = document.querySelector('.today-marker');
        todayEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const handleTopTabClick = (e: React.MouseEvent, path: '/discover' | '/tables' | '/settings') => {
    if (location.pathname === path) {
      e.preventDefault();
      scrollRootToTop();
    }
  };

  return (
    <nav className="bottom-navigation">
      <div className="bottom-navigation-inner">
      <Link to="/" className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`} onClick={handleCalendarClick}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="9" y1="4" x2="9" y2="10" />
          <line x1="15" y1="4" x2="15" y2="10" />
        </svg>
        <span>{t('nav.calendar')}</span>
      </Link>
      <Link
        to="/discover"
        className={`nav-tab ${location.pathname === '/discover' ? 'active' : ''}`}
        onClick={(e) => handleTopTabClick(e, '/discover')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" stroke="none" />
        </svg>
        <span>{t('nav.discover')}</span>
      </Link>
      <Link
        to="/tables"
        className={`nav-tab ${location.pathname === '/tables' ? 'active' : ''}`}
        onClick={(e) => handleTopTabClick(e, '/tables')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
        </svg>
        <span>{t('nav.tables')}</span>
      </Link>
      <Link
        to="/settings"
        className={`nav-tab ${location.pathname === '/settings' ? 'active' : ''}`}
        onClick={(e) => handleTopTabClick(e, '/settings')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span>{t('nav.settings')}</span>
      </Link>
      </div>
    </nav>
  );
}
