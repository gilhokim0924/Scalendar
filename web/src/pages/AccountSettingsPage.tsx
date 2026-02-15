import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { fetchUserProfile, upsertUserProfile } from '../services/userProfile';
import { clearUserSelectedTeams } from '../services/userPreferences';
import { fetchSelectedTeamNames } from '../services/userPreferences';
import './AccountSettingsPage.css';

export default function AccountSettingsPage() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const isGuestMode = window.sessionStorage.getItem('guestMode') === 'true';
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedTeamNames, setSelectedTeamNames] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!user?.id || isGuestMode) return;
      try {
        const profile = await fetchUserProfile(user.id);
        if (cancelled) return;
        const defaultName = user.user_metadata?.full_name
          || user.user_metadata?.name
          || user.email?.split('@')[0]
          || '';
        setDisplayName(profile?.display_name ?? defaultName);
        setAvatarUrl(profile?.avatar_url ?? '');
      } catch (error) {
        console.error('Failed to load profile', error);
      }
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, [isGuestMode, user]);

  const userName = displayName
    || user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || (isGuestMode ? t('settings.guest') : 'Scalendar User');
  const avatarLetter = String(userName).trim().charAt(0).toUpperCase() || 'S';
  const subLabel = user?.email || (isGuestMode ? t('settings.guestMode') : t('settings.manageAccount'));
  const canEditProfile = Boolean(user?.id) && !isGuestMode;
  const selectedTeams = (() => {
    try {
      const raw = window.localStorage.getItem('selectedTeams');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  useEffect(() => {
    let cancelled = false;
    const loadSelectedTeamNames = async () => {
      try {
        const map = await fetchSelectedTeamNames(selectedTeams);
        if (cancelled) return;
        const names = selectedTeams.map((id) => map[id] ?? id);
        setSelectedTeamNames(names);
      } catch (error) {
        console.error('Failed to load selected team names', error);
        if (!cancelled) {
          setSelectedTeamNames(selectedTeams);
        }
      }
    };

    void loadSelectedTeamNames();
    return () => {
      cancelled = true;
    };
  }, [selectedTeams.join(',')]);

  const handleSaveProfile = () => {
    if (!user?.id || isGuestMode) return;

    const run = async () => {
      try {
        setIsSaving(true);
        setStatusMessage(null);
        await upsertUserProfile({
          id: user.id,
          display_name: displayName.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        });
        setStatusMessage(t('settings.profileSaved'));
      } catch (error) {
        console.error('Failed to save profile', error);
        setStatusMessage(t('settings.profileSaveFailed'));
      } finally {
        setIsSaving(false);
      }
    };

    void run();
  };

  const handleSignOut = () => {
    const run = async () => {
      try {
        if (user?.id) {
          await signOut();
        }
        window.localStorage.removeItem('selectedTeams');
        window.sessionStorage.removeItem('guestMode');
      } catch (error) {
        console.error('Failed to sign out', error);
      } finally {
        window.location.href = '/';
      }
    };
    void run();
  };

  const handleDelete = () => {
    if (!confirm(t('settings.deleteConfirm'))) return;

    const run = async () => {
      try {
        if (user?.id) {
          await clearUserSelectedTeams(user.id);
          await upsertUserProfile({
            id: user.id,
            display_name: null,
            avatar_url: null,
          });
        }
        window.localStorage.removeItem('selectedTeams');
        setDisplayName('');
        setAvatarUrl('');
        setStatusMessage(t('settings.deleted'));
      } catch (error) {
        console.error('Failed to delete account data', error);
        setStatusMessage(t('settings.deleteFailed'));
      }
    };
    void run();
  };

  return (
    <div className="account-page">
      <header className="account-header">
        <div className="account-header-inner">
          <h1 className="account-title">{t('settings.manageAccount')}</h1>
        </div>
      </header>

      <div className="account-content">
        <div className="account-panel">
          <div className="account-section account-section-plain">
            <div className="account-picture-section">
              <div className="account-avatar account-avatar-large">
                {avatarUrl ? <img src={avatarUrl} alt={userName} className="account-avatar-img" /> : avatarLetter}
              </div>
              <div className="account-name account-name-large">{userName}</div>
              <div className="account-email">{subLabel}</div>
              <button className="account-photo-btn" disabled={!canEditProfile}>
                {t('settings.changePhoto')}
              </button>
            </div>
          </div>

          <div className="account-section">
            <div className="account-form">
              <label className="account-label">
                {t('settings.displayName')}
                <input
                  className="account-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('settings.displayNamePlaceholder')}
                  disabled={!canEditProfile}
                />
              </label>
            </div>
          </div>

          <div className="account-section account-section-myteams">
            <label className="account-label">
              {t('settings.myTeams')}
              {selectedTeamNames.length > 0 ? (
                <div className="account-selected-list">
                  {selectedTeamNames.map((name, idx) => (
                    <span key={`${name}-${idx}`} className="account-selected-chip">{name}</span>
                  ))}
                </div>
              ) : (
                <span className="account-selected-empty">{t('settings.selectYourTeams')}</span>
              )}
            </label>
          </div>
        <div className="account-action-list">
          <button className="account-action-item save" onClick={handleSaveProfile} disabled={!canEditProfile || isSaving}>
            <span className="account-action-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h8.793a2.5 2.5 0 0 1 1.768.732l2.207 2.207A2.5 2.5 0 0 1 20 8.707V17.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 4v6h8V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            <span>{isSaving ? t('settings.saving') : t('settings.saveProfile')}</span>
          </button>
          <button className="account-action-item signout" onClick={handleSignOut}>
            <span className="account-action-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M7.757 5.757a8 8 0 1 0 8.486 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            <span>{t('settings.signOut')}</span>
          </button>
          <button className="account-action-item danger" onClick={handleDelete}>
            <span className="account-action-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <path d="M9.5 4h5a1 1 0 0 1 1 1v2h-7V5a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 7l.8 11a2 2 0 0 0 2 1.85h4.4a2 2 0 0 0 2-1.85L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span>{t('settings.deleteAccount')}</span>
          </button>
        </div>
        {statusMessage && <div className="account-status">{statusMessage}</div>}
      </div>
      </div>
    </div>
  );
}
