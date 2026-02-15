import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AccountSettingsPage.css';

export default function AccountSettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const userName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || 'Scalendar User';
  const avatarLetter = String(userName).trim().charAt(0).toUpperCase() || 'S';

  const handleSignOut = () => {
    const run = async () => {
      try {
        await signOut();
        window.localStorage.removeItem('selectedTeams');
        window.localStorage.removeItem('guestMode');
      } catch (error) {
        console.error('Failed to sign out', error);
      } finally {
        navigate('/', { replace: true });
      }
    };
    void run();
  };

  return (
    <div className="account-page">
      <header className="account-header">
        <button className="account-back" onClick={() => navigate('/settings')}>
          <span>←</span>
        </button>
        <h1 className="account-title">{t('settings.manageAccount')}</h1>
      </header>

      <div className="account-content">
        <div className="account-card">
          <div className="account-avatar">{avatarLetter}</div>
          <div className="account-info">
            <div className="account-name">{userName}</div>
            <div className="account-email">{user?.email}</div>
          </div>
        </div>

        <div className="account-section">
          <button className="account-signout" onClick={handleSignOut}>
            {t('settings.signOut')}
          </button>
        </div>
      </div>
    </div>
  );
}
