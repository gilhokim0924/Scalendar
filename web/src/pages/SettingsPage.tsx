import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import './SettingsPage.css';

export default function SettingsPage() {
  const [timezone, setTimezone] = useState('UTC');

  useEffect(() => {
    const saved = localStorage.getItem('timezone');
    if (saved) {
      setTimezone(saved);
    } else {
      // Auto-detect timezone
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(detected);
    }
  }, []);

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    localStorage.setItem('timezone', value);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all your data? This will remove all your team selections.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage your calendar preferences</p>
          </div>
          <Navigation />
        </div>
      </header>

      <main className="page-content">
        <section className="settings-section">
          <h2 className="section-title">Display</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3 className="setting-label">Timezone</h3>
              <p className="setting-description">Events will be displayed in this timezone</p>
            </div>
            <select
              value={timezone}
              onChange={(e) => handleTimezoneChange(e.target.value)}
              className="setting-select"
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
        </section>

        <section className="settings-section">
          <h2 className="section-title">About</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3 className="setting-label">Version</h3>
              <p className="setting-description">Scalendar v1.0.0 (MVP)</p>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3 className="setting-label">Data Sources</h3>
              <p className="setting-description">TheSportsDB & OpenF1 API</p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="section-title danger">Data Management</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3 className="setting-label">Clear All Data</h3>
              <p className="setting-description">Remove all your team selections and preferences</p>
            </div>
            <button onClick={clearAllData} className="danger-button">
              Clear
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
