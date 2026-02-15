import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useUserPreferences } from '../hooks/useUserPreferences';
import './SettingsPage.css';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { use24HourTime, hideScores, setUse24HourTime, setHideScores } = useUserPreferences();

  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [timezone, setTimezone] = useState('UTC');
  const [eventReminders, setEventReminders] = useState(true);

  useEffect(() => {
    const savedTz = localStorage.getItem('timezone');
    if (savedTz) {
      setTimezone(savedTz);
    } else {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detected);
    }
    const savedReminders = localStorage.getItem('eventReminders');
    if (savedReminders !== null) setEventReminders(savedReminders === 'true');
  }, []);

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    localStorage.setItem('timezone', value);
  };

  const toggleEventReminders = () => {
    const next = !eventReminders;
    setEventReminders(next);
    localStorage.setItem('eventReminders', String(next));
  };

  const toggleUse24HourTime = () => {
    const next = !use24HourTime;
    setUse24HourTime(next);
  };

  const toggleHideScores = () => {
    const next = !hideScores;
    setHideScores(next);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const clearAllData = () => {
    if (confirm(t('settings.clearConfirm'))) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1 className="settings-title">{t('settings.title')}</h1>
      </header>

      <div className="settings-content">
        {/* Profile Card */}
        <div className="settings-profile-card">
          <div className="settings-profile-avatar">S</div>
          <div className="settings-profile-info">
            <div className="settings-profile-name">Scalendar User</div>
            <div className="settings-profile-sub">{t('settings.manageAccount')}</div>
          </div>
          <svg className="settings-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Calendar Sync */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t('settings.calendarSync')}</h2>
          <div className="settings-row">
            <div className="settings-row-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15.833 3.333H4.167C3.247 3.333 2.5 4.08 2.5 5v11.667c0 .92.746 1.666 1.667 1.666h11.666c.92 0 1.667-.746 1.667-1.666V5c0-.92-.746-1.667-1.667-1.667zM13.333 1.667V5M6.667 1.667V5M2.5 8.333h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="settings-row-label">{t('settings.exportCalendar')}</div>
            <svg className="settings-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t('settings.notifications')}</h2>
          <div className="settings-row">
            <div className="settings-row-label">{t('settings.eventReminders')}</div>
            <button
              className={`settings-toggle ${eventReminders ? 'on' : ''}`}
              onClick={toggleEventReminders}
            >
              <div className="settings-toggle-knob" />
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t('settings.preferences')}</h2>
          <div className="settings-row">
            <div className="settings-row-label">{t('settings.appearance')}</div>
            <div className="settings-theme-picker">
              {(['system', 'light', 'dark'] as const).map(opt => (
                <button
                  key={opt}
                  className={`settings-theme-option ${theme === opt ? 'active' : ''}`}
                  onClick={() => setTheme(opt)}
                >
                  {t(`settings.${opt}`)}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-label">{t('settings.language')}</div>
            <select
              value={i18n.language}
              onChange={e => handleLanguageChange(e.target.value)}
              className="settings-select"
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </select>
          </div>
          <div className="settings-row">
            <div className="settings-row-label">{t('settings.timezone')}</div>
            <select
              value={timezone}
              onChange={e => handleTimezoneChange(e.target.value)}
              className="settings-select"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (US)</option>
              <option value="America/Chicago">Central Time (US)</option>
              <option value="America/Denver">Mountain Time (US)</option>
              <option value="America/Los_Angeles">Pacific Time (US)</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Seoul">Seoul</option>
              <option value="Asia/Bangkok">Bangkok</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>
          <div className="settings-row">
            <div className="settings-row-label">{t('settings.twentyFourHourTime')}</div>
            <button
              className={`settings-toggle ${use24HourTime ? 'on' : ''}`}
              onClick={toggleUse24HourTime}
            >
              <div className="settings-toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-label">{t('settings.hideScoresOrWinners')}</div>
            <button
              className={`settings-toggle ${hideScores ? 'on' : ''}`}
              onClick={toggleHideScores}
            >
              <div className="settings-toggle-knob" />
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h2 className="settings-section-title danger">{t('settings.dataManagement')}</h2>
          <div className="settings-row">
            <div className="settings-row-label">{t('settings.clearAllData')}</div>
            <button onClick={clearAllData} className="settings-danger-btn">
              {t('settings.clear')}
            </button>
          </div>
        </div>

        {/* About */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t('settings.about')}</h2>
          <div className="settings-row">
            <div className="settings-row-label">{t('settings.version')}</div>
            <div className="settings-row-value">1.0.0 (MVP)</div>
          </div>
          <div className="settings-row">
            <div className="settings-row-label">{t('settings.dataSources')}</div>
            <div className="settings-row-value">TheSportsDB & OpenF1</div>
          </div>
          <div className="settings-row">
            <div className="settings-row-label">{t('settings.termsOfService')}</div>
            <svg className="settings-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="settings-row">
            <div className="settings-row-label">{t('settings.privacyPolicy')}</div>
            <svg className="settings-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
