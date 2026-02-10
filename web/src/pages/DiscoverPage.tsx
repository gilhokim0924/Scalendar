import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { mockEvents, mockSports } from '../utils/mockData';
import './DiscoverPage.css';

type SportFilter = 'all' | '1' | '2';

export default function DiscoverPage() {
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');

  const upcomingEvents = [...mockEvents]
    .sort((a, b) => parseISO(a.datetime_utc).getTime() - parseISO(b.datetime_utc).getTime())
    .filter(e => sportFilter === 'all' || e.sport_id === sportFilter)
    .slice(0, 6);

  const competitions = [
    {
      name: 'Premier League',
      icon: '⚽',
      sportId: '1',
      accent: 'pl',
      eventCount: mockEvents.filter(e => e.sport_id === '1').length,
    },
    {
      name: 'Formula 1',
      icon: '🏎️',
      sportId: '2',
      accent: 'f1',
      eventCount: mockEvents.filter(e => e.sport_id === '2').length,
    },
  ];

  const recentlyUpdated = mockSports.map(sport => ({
    ...sport,
    eventCount: mockEvents.filter(e => e.sport_id === sport.id).length,
  }));

  return (
    <div className="discover-page">
      <header className="discover-header">
        <h1 className="discover-title">Discover</h1>
      </header>

      {/* Sport Filter Pills */}
      <div className="discover-filters">
        <button
          className={`discover-filter-btn ${sportFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSportFilter('all')}
        >
          All
        </button>
        <button
          className={`discover-filter-btn ${sportFilter === '1' ? 'active' : ''}`}
          onClick={() => setSportFilter('1')}
        >
          <span className="filter-icon">⚽</span>
          Football
        </button>
        <button
          className={`discover-filter-btn ${sportFilter === '2' ? 'active' : ''}`}
          onClick={() => setSportFilter('2')}
        >
          <span className="filter-icon">🏎️</span>
          Motorsport
        </button>
      </div>

      {/* Upcoming Events */}
      <section className="discover-section">
        <h2 className="discover-section-title">Upcoming Events</h2>
        <div className="upcoming-scroll">
          {upcomingEvents.map(event => (
            <div
              key={event.id}
              className={`upcoming-card ${event.sport_id === '1' ? 'pl' : 'f1'}`}
            >
              <div className="upcoming-card-date">
                {format(parseISO(event.datetime_utc), 'MMM d')}
              </div>
              <div className="upcoming-card-title">{event.title}</div>
              <div className="upcoming-card-venue">{event.venue}</div>
              <div className="upcoming-card-time">
                {format(parseISO(event.datetime_utc), 'HH:mm')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What's On This Month */}
      <section className="discover-section">
        <h2 className="discover-section-title">What's on this month</h2>
        <div className="competition-grid">
          {competitions.map(comp => (
            <div key={comp.sportId} className={`competition-card ${comp.accent}`}>
              <div className="competition-icon">{comp.icon}</div>
              <div className="competition-name">{comp.name}</div>
              <div className="competition-count">{comp.eventCount} events</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Updated */}
      <section className="discover-section">
        <h2 className="discover-section-title">Recently Updated</h2>
        <div className="recently-updated-list">
          {recentlyUpdated.map(sport => (
            <div key={sport.id} className="recently-updated-row">
              <div className="recently-updated-icon">{sport.icon}</div>
              <div className="recently-updated-info">
                <div className="recently-updated-name">{sport.name}</div>
                <div className="recently-updated-count">{sport.eventCount} upcoming</div>
              </div>
              <svg className="recently-updated-chevron" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
