import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { mockEvents, mockSports } from '../utils/mockData';
import { usePLEvents, useUCLEvents } from '../hooks/useFootballData';
import { useF1Events } from '../hooks/useF1Data';
import './DiscoverPage.css';

type SportFilter = 'all' | '1' | '2';

export default function DiscoverPage() {
  const { t } = useTranslation();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');

  const plEvents = usePLEvents();
  const uclEvents = useUCLEvents();
  const f1EventsQuery = useF1Events();

  const fallbackF1Events = useMemo(() => mockEvents.filter(e => e.sport_id === '2'), []);
  const f1Events = (f1EventsQuery.data && f1EventsQuery.data.length > 0)
    ? f1EventsQuery.data
    : fallbackF1Events;

  const allEvents = useMemo(() => {
    const footballEvents = [
      ...(plEvents.data ?? []),
      ...(uclEvents.data ?? []),
    ];
    return [...footballEvents, ...f1Events];
  }, [plEvents.data, uclEvents.data, f1Events]);

  const isLoading = plEvents.isLoading || uclEvents.isLoading || f1EventsQuery.isLoading;

  const upcomingEvents = [...allEvents]
    .sort((a, b) => parseISO(a.datetime_utc).getTime() - parseISO(b.datetime_utc).getTime())
    .filter(e => sportFilter === 'all' || e.sport_id === sportFilter)
    .slice(0, 6);

  const footballEventCount = allEvents.filter(e => e.sport_id === '1').length;
  const f1EventCount = f1Events.length;

  const competitions = [
    {
      name: 'Premier League',
      icon: '\u26BD',
      sportId: '1',
      accent: 'pl',
      eventCount: footballEventCount,
    },
    {
      name: 'Formula 1',
      icon: '\uD83C\uDFCE\uFE0F',
      sportId: '2',
      accent: 'f1',
      eventCount: f1EventCount,
    },
  ];

  const recentlyUpdated = mockSports.map(sport => ({
    ...sport,
    eventCount: allEvents.filter(e => e.sport_id === sport.id).length,
  }));

  return (
    <div className="discover-page">
      <header className="discover-header">
        <h1 className="discover-title">{t('discover.title')}</h1>
      </header>

      {/* Sport Filter Pills */}
      <div className="discover-filters">
        <button
          className={`discover-filter-btn ${sportFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSportFilter('all')}
        >
          {t('filters.all')}
        </button>
        <button
          className={`discover-filter-btn ${sportFilter === '1' ? 'active' : ''}`}
          onClick={() => setSportFilter('1')}
        >
          <span className="filter-icon">⚽</span>
          {t('filters.football')}
        </button>
        <button
          className={`discover-filter-btn ${sportFilter === '2' ? 'active' : ''}`}
          onClick={() => setSportFilter('2')}
        >
          <span className="filter-icon">🏎️</span>
          {t('filters.motorsport')}
        </button>
      </div>

      {/* Upcoming Events */}
      <section className="discover-section">
        <h2 className="discover-section-title">{t('discover.upcomingEvents')}</h2>
        <div className="upcoming-scroll">
          {isLoading ? (
            <div className="discover-loading">Loading...</div>
          ) : (
            upcomingEvents.map(event => (
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
            ))
          )}
        </div>
      </section>

      {/* What's On This Month */}
      <section className="discover-section">
        <h2 className="discover-section-title">{t('discover.whatsOn')}</h2>
        <div className="competition-grid">
          {competitions.map(comp => (
            <div key={comp.sportId} className={`competition-card ${comp.accent}`}>
              <div className="competition-icon">{comp.icon}</div>
              <div className="competition-name">{comp.name}</div>
              <div className="competition-count">{t('discover.events', { count: comp.eventCount })}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Updated */}
      <section className="discover-section">
        <h2 className="discover-section-title">{t('discover.recentlyUpdated')}</h2>
        <div className="recently-updated-list">
          {recentlyUpdated.map(sport => (
            <div key={sport.id} className="recently-updated-row">
              <div className="recently-updated-icon">{sport.icon}</div>
              <div className="recently-updated-info">
                <div className="recently-updated-name">{sport.name}</div>
                <div className="recently-updated-count">{t('discover.upcoming', { count: sport.eventCount })}</div>
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
