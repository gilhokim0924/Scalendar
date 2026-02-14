import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { mockEvents, mockSports } from '../utils/mockData';
import { FOOTBALL_LEAGUES, useLeagueEvents, usePLEvents, useUCLEvents } from '../hooks/useFootballData';
import { useF1Events } from '../hooks/useF1Data';
import './DiscoverPage.css';

type SportFilter = 'all' | '1' | '2';
type FootballSubFilter =
  | 'all'
  | 'Premier League'
  | 'Champions League'
  | 'Europa League'
  | 'Europa Conference League'
  | 'La Liga'
  | 'Bundesliga'
  | 'Serie A'
  | 'Ligue 1';
type MotorsportSubFilter = 'all' | 'Formula 1';

function getFootballAccent(competition: string): 'pl' | 'ucl' | 'laliga' | 'bundesliga' | 'seriea' | 'ligue1' | 'europa' | 'conference' {
  const c = competition.toLowerCase();
  if (c.includes('conference')) return 'conference';
  if (c.includes('champions')) return 'ucl';
  if (c.includes('la liga')) return 'laliga';
  if (c.includes('bundesliga')) return 'bundesliga';
  if (c.includes('serie a')) return 'seriea';
  if (c.includes('ligue 1')) return 'ligue1';
  if (c.includes('europa')) return 'europa';
  return 'pl';
}

export default function DiscoverPage() {
  const { t } = useTranslation();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [footballSubFilter, setFootballSubFilter] = useState<FootballSubFilter>('all');
  const [motorsportSubFilter, setMotorsportSubFilter] = useState<MotorsportSubFilter>('all');

  const plEvents = usePLEvents();
  const uclEvents = useUCLEvents();
  const europaEvents = useLeagueEvents(FOOTBALL_LEAGUES.europaLeague.id);
  const conferenceEvents = useLeagueEvents(FOOTBALL_LEAGUES.conferenceLeague.id);
  const laLigaEvents = useLeagueEvents(FOOTBALL_LEAGUES.laLiga.id);
  const bundesligaEvents = useLeagueEvents(FOOTBALL_LEAGUES.bundesliga.id);
  const serieAEvents = useLeagueEvents(FOOTBALL_LEAGUES.serieA.id);
  const ligue1Events = useLeagueEvents(FOOTBALL_LEAGUES.ligue1.id);
  const f1EventsQuery = useF1Events();

  const fallbackF1Events = useMemo(() => mockEvents.filter(e => e.sport_id === '2'), []);
  const f1Events = (f1EventsQuery.data && f1EventsQuery.data.length > 0)
    ? f1EventsQuery.data
    : fallbackF1Events;

  const allEvents = useMemo(() => {
    const footballEvents = [
      ...(plEvents.data ?? []),
      ...(uclEvents.data ?? []),
      ...(europaEvents.data ?? []),
      ...(conferenceEvents.data ?? []),
      ...(laLigaEvents.data ?? []),
      ...(bundesligaEvents.data ?? []),
      ...(serieAEvents.data ?? []),
      ...(ligue1Events.data ?? []),
    ];
    return [...footballEvents, ...f1Events];
  }, [plEvents.data, uclEvents.data, europaEvents.data, conferenceEvents.data, laLigaEvents.data, bundesligaEvents.data, serieAEvents.data, ligue1Events.data, f1Events]);

  const isLoading = plEvents.isLoading || uclEvents.isLoading || europaEvents.isLoading || conferenceEvents.isLoading || laLigaEvents.isLoading || bundesligaEvents.isLoading || serieAEvents.isLoading || ligue1Events.isLoading || f1EventsQuery.isLoading;

  const upcomingEvents = [...allEvents]
    .sort((a, b) => parseISO(a.datetime_utc).getTime() - parseISO(b.datetime_utc).getTime())
    .filter((event) => {
      if (sportFilter === 'all') return true;
      if (event.sport_id !== sportFilter) return false;

      if (sportFilter === '1') {
        if (footballSubFilter === 'all') return true;
        const competition = event.competition.toLowerCase();
        return competition.includes(footballSubFilter.toLowerCase());
      }

      if (sportFilter === '2') {
        if (motorsportSubFilter === 'all') return true;
        return motorsportSubFilter === 'Formula 1';
      }

      return true;
    })
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
      name: 'Champions League',
      icon: '\uD83C\uDFC6',
      sportId: '1',
      accent: 'ucl',
      eventCount: (uclEvents.data ?? []).length,
    },
    {
      name: 'Europa League',
      icon: '\uD83C\uDFC6',
      sportId: '1',
      accent: 'europa',
      eventCount: (europaEvents.data ?? []).length,
    },
    {
      name: 'Europa Conference League',
      icon: '\uD83C\uDFC6',
      sportId: '1',
      accent: 'conference',
      eventCount: (conferenceEvents.data ?? []).length,
    },
    {
      name: 'La Liga',
      icon: '\u26BD',
      sportId: '1',
      accent: 'laliga',
      eventCount: (laLigaEvents.data ?? []).length,
    },
    {
      name: 'Bundesliga',
      icon: '\u26BD',
      sportId: '1',
      accent: 'bundesliga',
      eventCount: (bundesligaEvents.data ?? []).length,
    },
    {
      name: 'Serie A',
      icon: '\u26BD',
      sportId: '1',
      accent: 'seriea',
      eventCount: (serieAEvents.data ?? []).length,
    },
    {
      name: 'Ligue 1',
      icon: '\u26BD',
      sportId: '1',
      accent: 'ligue1',
      eventCount: (ligue1Events.data ?? []).length,
    },
    {
      name: 'Formula 1',
      icon: '\uD83C\uDFCE\uFE0F',
      sportId: '2',
      accent: 'f1',
      eventCount: f1EventCount,
    },
  ];

  const featuredCompetitions = useMemo(() => {
    const shuffled = [...competitions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 2);
  }, [footballEventCount, f1EventCount, uclEvents.data, europaEvents.data, conferenceEvents.data, laLigaEvents.data, bundesligaEvents.data, serieAEvents.data, ligue1Events.data]);

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
          onClick={() => {
            setSportFilter('all');
            setFootballSubFilter('all');
            setMotorsportSubFilter('all');
          }}
        >
          {t('filters.all')}
        </button>
        <button
          className={`discover-filter-btn ${sportFilter === '1' ? 'active' : ''}`}
          onClick={() => {
            setSportFilter('1');
            setFootballSubFilter('all');
          }}
        >
          <span className="filter-icon">⚽</span>
          {t('filters.football')}
        </button>
        <button
          className={`discover-filter-btn ${sportFilter === '2' ? 'active' : ''}`}
          onClick={() => {
            setSportFilter('2');
            setMotorsportSubFilter('all');
          }}
        >
          <span className="filter-icon">🏎️</span>
          {t('filters.motorsport')}
        </button>
      </div>

      {sportFilter === '1' && (
        <div className="discover-sub-filters">
          <div className="discover-sub-row">
            <button className={`discover-filter-btn discover-sub-btn ${footballSubFilter === 'all' ? 'active' : ''}`} onClick={() => setFootballSubFilter('all')}>
              {t('filters.all')}
            </button>
            <button className={`discover-filter-btn discover-sub-btn discover-sub-pl ${footballSubFilter === 'Premier League' ? 'active' : ''}`} onClick={() => setFootballSubFilter('Premier League')}>
              {t('filters.premierLeague')}
            </button>
            <button className={`discover-filter-btn discover-sub-btn discover-sub-laliga ${footballSubFilter === 'La Liga' ? 'active' : ''}`} onClick={() => setFootballSubFilter('La Liga')}>
              {t('filters.laLiga')}
            </button>
            <button className={`discover-filter-btn discover-sub-btn discover-sub-bundesliga ${footballSubFilter === 'Bundesliga' ? 'active' : ''}`} onClick={() => setFootballSubFilter('Bundesliga')}>
              {t('filters.bundesliga')}
            </button>
            <button className={`discover-filter-btn discover-sub-btn discover-sub-seriea ${footballSubFilter === 'Serie A' ? 'active' : ''}`} onClick={() => setFootballSubFilter('Serie A')}>
              {t('filters.serieA')}
            </button>
            <button className={`discover-filter-btn discover-sub-btn discover-sub-ligue1 ${footballSubFilter === 'Ligue 1' ? 'active' : ''}`} onClick={() => setFootballSubFilter('Ligue 1')}>
              {t('filters.ligue1')}
            </button>
          </div>
          <div className="discover-sub-row">
            <button className={`discover-filter-btn discover-sub-btn discover-sub-ucl ${footballSubFilter === 'Champions League' ? 'active' : ''}`} onClick={() => setFootballSubFilter('Champions League')}>
              {t('filters.championsLeague')}
            </button>
            <button className={`discover-filter-btn discover-sub-btn discover-sub-europa ${footballSubFilter === 'Europa League' ? 'active' : ''}`} onClick={() => setFootballSubFilter('Europa League')}>
              {t('filters.europaLeague')}
            </button>
            <button className={`discover-filter-btn discover-sub-btn discover-sub-conference ${footballSubFilter === 'Europa Conference League' ? 'active' : ''}`} onClick={() => setFootballSubFilter('Europa Conference League')}>
              {t('filters.europaConferenceLeague')}
            </button>
          </div>
        </div>
      )}

      {sportFilter === '2' && (
        <div className="discover-sub-filters">
          <div className="discover-sub-row">
            <button className={`discover-filter-btn discover-sub-btn ${motorsportSubFilter === 'all' ? 'active' : ''}`} onClick={() => setMotorsportSubFilter('all')}>
              {t('filters.all')}
            </button>
            <button className={`discover-filter-btn discover-sub-btn discover-sub-f1 ${motorsportSubFilter === 'Formula 1' ? 'active' : ''}`} onClick={() => setMotorsportSubFilter('Formula 1')}>
              Formula 1
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <section className="discover-section">
        <h2 className="discover-section-title">{t('discover.upcomingEvents')}</h2>
        <div className="upcoming-scroll">
          {isLoading ? (
            <div className="discover-loading">
              <span className="loading-with-spinner">
                <span className="loading-spinner" aria-hidden="true" />
                <span>Loading...</span>
              </span>
            </div>
          ) : (
            upcomingEvents.map(event => (
              <div
                key={event.id}
                className={`upcoming-card ${event.sport_id === '1' ? getFootballAccent(event.competition) : 'f1'}`}
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
          {featuredCompetitions.map(comp => (
            <div key={comp.name} className={`competition-card ${comp.accent}`}>
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
