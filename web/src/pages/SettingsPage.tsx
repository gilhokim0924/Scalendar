import { useState, useEffect } from 'react';
import './SettingsPage.css';

export default function SettingsPage() {
  const [timezone, setTimezone] = useState('UTC');
  const [morningDigest, setMorningDigest] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);

  useEffect(() => {
    const savedTz = localStorage.getItem('timezone');
    if (savedTz) {
      setTimezone(savedTz);
    } else {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detected);
    }
    const savedDigest = localStorage.getItem('morningDigest');
    if (savedDigest !== null) setMorningDigest(savedDigest === 'true');
    const savedReminders = localStorage.getItem('eventReminders');
    if (savedReminders !== null) setEventReminders(savedReminders === 'true');
  }, []);

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    localStorage.setItem('timezone', value);
  };

  const toggleMorningDigest = () => {
    const next = !morningDigest;
    setMorningDigest(next);
    localStorage.setItem('morningDigest', String(next));
  };

  const toggleEventReminders = () => {
    const next = !eventReminders;
    setEventReminders(next);
    localStorage.setItem('eventReminders', String(next));
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all your data? This will remove all your team selections and preferences.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1 className="settings-title">Settings</h1>
      </header>

      <div className="settings-content">
        {/* Profile Card */}
        <div className="settings-profile-card">
          <div className="settings-profile-avatar">S</div>
          <div className="settings-profile-info">
            <div className="settings-profile-name">Scalendar User</div>
            <div className="settings-profile-sub">Manage your account</div>
          </div>
          <svg className="settings-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Calendar Sync */}
        <div className="settings-section">
          <h2 className="settings-section-title">Calendar Sync</h2>
          <div className="settings-row">
            <div className="settings-row-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15.833 3.333H4.167C3.247 3.333 2.5 4.08 2.5 5v11.667c0 .92.746 1.666 1.667 1.666h11.666c.92 0 1.667-.746 1.667-1.666V5c0-.92-.746-1.667-1.667-1.667zM13.333 1.667V5M6.667 1.667V5M2.5 8.333h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="settings-row-label">Export Calendar Feed</div>
            <svg className="settings-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <h2 className="settings-section-title">Notifications</h2>
          <div className="settings-row">
            <div className="settings-row-label">Morning Digest</div>
            <button
              className={`settings-toggle ${morningDigest ? 'on' : ''}`}
              onClick={toggleMorningDigest}
            >
              <div className="settings-toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-label">Event Reminders</div>
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
          <h2 className="settings-section-title">Preferences</h2>
          <div className="settings-row">
            <div className="settings-row-label">Timezone</div>
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
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-section">
          <h2 className="settings-section-title danger">Data Management</h2>
          <div className="settings-row">
            <div className="settings-row-label">Clear All Data</div>
            <button onClick={clearAllData} className="settings-danger-btn">
              Clear
            </button>
          </div>
        </div>

        {/* About */}
        <div className="settings-section">
          <h2 className="settings-section-title">About</h2>
          <div className="settings-row">
            <div className="settings-row-label">Version</div>
            <div className="settings-row-value">1.0.0 (MVP)</div>
          </div>
          <div className="settings-row">
            <div className="settings-row-label">Data Sources</div>
            <div className="settings-row-value">TheSportsDB & OpenF1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
