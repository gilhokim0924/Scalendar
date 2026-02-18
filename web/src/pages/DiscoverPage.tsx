import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getTeamInitials, mockEvents } from '../utils/mockData';
import { FOOTBALL_LEAGUES, useLeagueEvents, usePLEvents, useUCLEvents } from '../hooks/useFootballData';
import { useF1Events } from '../hooks/useF1Data';
import { BASEBALL_LEAGUES, useBaseballLeagueEvents } from '../hooks/useBaseballData';
import { formatPreferenceTime, useUserPreferences } from '../hooks/useUserPreferences';
import type { SportsEvent } from '../types';
import './DiscoverPage.css';

type SportFilter = 'all' | '1' | '2' | '3' | '4' | '5';
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
type BaseballSubFilter = 'all' | 'MLB' | 'KBO';
type BasketballSubFilter = 'all' | 'NBA';
type AmericanFootballSubFilter = 'all' | 'NFL';
type LeagueThisMonthCard = { name: string; icon: string; accent: string; eventCount: number };

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

function getEventAccent(event: SportsEvent): string {
  if (event.sport_id === '1') return getFootballAccent(event.competition);
  if (event.sport_id === '2') return 'f1';
  if (event.sport_id === '4') return 'nba';
  if (event.sport_id === '5') return 'nfl';
  return event.competition.toLowerCase().includes('kbo') ? 'kbo' : 'mlb';
}

function getCalendarThemeClass(event: SportsEvent): string {
  const accent = getEventAccent(event);
  if (accent === 'pl') return 'premier-league';
  if (accent === 'ucl') return 'champions-league';
  if (accent === 'laliga') return 'la-liga';
  if (accent === 'bundesliga') return 'bundesliga';
  if (accent === 'seriea') return 'serie-a';
  if (accent === 'ligue1') return 'ligue-1';
  if (accent === 'europa') return 'europa-league';
  if (accent === 'conference') return 'conference-league';
  if (accent === 'f1') return 'formula-one';
  if (accent === 'nba') return 'nba';
  if (accent === 'nfl') return 'nfl';
  return accent;
}

function shuffleCards<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function DiscoverPage() {
  const { t } = useTranslation();
  const { use24HourTime, hideScores } = useUserPreferences();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');
  const [footballSubFilter, setFootballSubFilter] = useState<FootballSubFilter>('all');
  const [motorsportSubFilter, setMotorsportSubFilter] = useState<MotorsportSubFilter>('all');
  const [baseballSubFilter, setBaseballSubFilter] = useState<BaseballSubFilter>('all');
  const [basketballSubFilter, setBasketballSubFilter] = useState<BasketballSubFilter>('all');
  const [americanFootballSubFilter, setAmericanFootballSubFilter] = useState<AmericanFootballSubFilter>('all');
  const [selectedUpcomingEvent, setSelectedUpcomingEvent] = useState<SportsEvent | null>(null);
  const [selectedLeagueName, setSelectedLeagueName] = useState<string | null>(null);
  const [referenceNowTs] = useState(() => Date.now());

  const plEvents = usePLEvents();
  const uclEvents = useUCLEvents();
  const europaEvents = useLeagueEvents(FOOTBALL_LEAGUES.europaLeague.id);
  const conferenceEvents = useLeagueEvents(FOOTBALL_LEAGUES.conferenceLeague.id);
  const laLigaEvents = useLeagueEvents(FOOTBALL_LEAGUES.laLiga.id);
  const bundesligaEvents = useLeagueEvents(FOOTBALL_LEAGUES.bundesliga.id);
  const serieAEvents = useLeagueEvents(FOOTBALL_LEAGUES.serieA.id);
  const ligue1Events = useLeagueEvents(FOOTBALL_LEAGUES.ligue1.id);
  const mlbEvents = useBaseballLeagueEvents(BASEBALL_LEAGUES.mlb.id);
  const kboEvents = useBaseballLeagueEvents(BASEBALL_LEAGUES.kbo.id);
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
    const baseballEvents = [
      ...(mlbEvents.data ?? []),
      ...(kboEvents.data ?? []),
    ];
    return [...footballEvents, ...baseballEvents, ...f1Events];
  }, [plEvents.data, uclEvents.data, europaEvents.data, conferenceEvents.data, laLigaEvents.data, bundesligaEvents.data, serieAEvents.data, ligue1Events.data, mlbEvents.data, kboEvents.data, f1Events]);

  const isLoading = plEvents.isLoading || uclEvents.isLoading || europaEvents.isLoading || conferenceEvents.isLoading || laLigaEvents.isLoading || bundesligaEvents.isLoading || serieAEvents.isLoading || ligue1Events.isLoading || mlbEvents.isLoading || kboEvents.isLoading || f1EventsQuery.isLoading;
  const isWipSportSelected = sportFilter === '4' || sportFilter === '5';

  const upcomingEvents = [...allEvents]
    .filter((event) => parseISO(event.datetime_utc).getTime() >= referenceNowTs)
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
      if (sportFilter === '3') {
        if (baseballSubFilter === 'all') return true;
        const competition = event.competition.toLowerCase();
        return competition.includes(baseballSubFilter.toLowerCase());
      }
      if (sportFilter === '4') {
        if (basketballSubFilter === 'all') return true;
        return event.competition.toLowerCase().includes('nba');
      }
      if (sportFilter === '5') {
        if (americanFootballSubFilter === 'all') return true;
        return event.competition.toLowerCase().includes('nfl');
      }

      return true;
    })
    .slice(0, 6);

  const now = new Date(referenceNowTs);
  const nowTs = now.getTime();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const leaguesThisMonth = useMemo(() => {
    const byLeague = new Map<string, { name: string; icon: string; accent: string; eventCount: number }>();

    for (const event of allEvents) {
      const eventDate = parseISO(event.datetime_utc);
      if (Number.isNaN(eventDate.getTime())) continue;
      if (eventDate.getTime() < nowTs) continue;
      if (eventDate.getFullYear() !== currentYear || eventDate.getMonth() !== currentMonth) continue;

      const name = event.competition;
      const icon = event.sport_id === '2'
        ? '\uD83C\uDFCE\uFE0F'
        : event.sport_id === '3'
          ? '\u26BE'
          : event.sport_id === '4'
            ? '\uD83C\uDFC0'
            : event.sport_id === '5'
              ? '\uD83C\uDFC8'
              : '\u26BD';
      const accent = event.sport_id === '1'
        ? getFootballAccent(event.competition)
        : event.sport_id === '2'
          ? 'f1'
          : event.sport_id === '4'
            ? 'nba'
            : event.sport_id === '5'
              ? 'nfl'
          : event.competition.toLowerCase().includes('kbo')
            ? 'kbo'
            : 'mlb';

      const row = byLeague.get(name) ?? { name, icon, accent, eventCount: 0 };
      row.eventCount += 1;
      byLeague.set(name, row);
    }

    return Array.from(byLeague.values()).sort((a, b) => {
      if (b.eventCount !== a.eventCount) return b.eventCount - a.eventCount;
      return a.name.localeCompare(b.name);
    });
  }, [allEvents, currentMonth, currentYear, nowTs]);

  const shuffledLeaguesThisMonth = useMemo<LeagueThisMonthCard[]>(
    () => shuffleCards(leaguesThisMonth),
    [leaguesThisMonth],
  );

  const selectedLeagueGames = useMemo(() => {
    if (!selectedLeagueName) return [];
    return allEvents
      .filter((event) => {
        const eventDate = parseISO(event.datetime_utc);
        if (Number.isNaN(eventDate.getTime())) return false;
        if (eventDate.getTime() < nowTs) return false;
        return event.competition === selectedLeagueName
          && eventDate.getFullYear() === currentYear
          && eventDate.getMonth() === currentMonth;
      })
      .sort((a, b) => parseISO(a.datetime_utc).getTime() - parseISO(b.datetime_utc).getTime());
  }, [allEvents, currentMonth, currentYear, selectedLeagueName, nowTs]);
  const selectedLeagueAccent = useMemo(() => {
    if (!selectedLeagueName) return 'pl';
    const leagueEvent = allEvents.find((event) => event.competition === selectedLeagueName);
    return leagueEvent ? getEventAccent(leagueEvent) : 'pl';
  }, [allEvents, selectedLeagueName]);

  const recentlyUpdated = useMemo(() => {
    const sports = [
      { id: '1', name: t('filters.football'), icon: '\u26BD' },
      { id: '3', name: t('filters.baseball'), icon: '\u26BE' },
      { id: '4', name: t('filters.basketball'), icon: '\uD83C\uDFC0' },
      { id: '5', name: t('filters.americanFootball'), icon: '\uD83C\uDFC8' },
      { id: '2', name: t('filters.motorsport'), icon: '\uD83C\uDFCE\uFE0F' },
    ];

    return sports.map((sport) => {
      const eventsForSport = allEvents.filter((event) => event.sport_id === sport.id);
      const latestPastTimestamp = eventsForSport
        .map((event) => parseISO(event.datetime_utc).getTime())
        .filter((ts) => Number.isFinite(ts) && ts <= referenceNowTs)
        .sort((a, b) => b - a)[0];

      const lastUpdatedLabel = latestPastTimestamp
        ? t('discover.lastUpdated', { date: `${format(new Date(latestPastTimestamp), 'MMM d, yyyy')} ${formatPreferenceTime(new Date(latestPastTimestamp), use24HourTime)}` })
        : t('discover.noData');

      return {
        ...sport,
        eventCount: eventsForSport.length,
        lastUpdatedLabel,
      };
    });
  }, [allEvents, t, use24HourTime, referenceNowTs]);

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
            setBaseballSubFilter('all');
            setBasketballSubFilter('all');
            setAmericanFootballSubFilter('all');
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
          className={`discover-filter-btn ${sportFilter === '3' ? 'active' : ''}`}
          onClick={() => {
            setSportFilter('3');
            setBaseballSubFilter('all');
          }}
        >
          <span className="filter-icon">⚾</span>
          {t('filters.baseball')}
        </button>
        <button
          className={`discover-filter-btn ${sportFilter === '4' ? 'active' : ''}`}
          onClick={() => {
            setSportFilter('4');
            setBasketballSubFilter('all');
          }}
        >
          <span className="filter-icon">🏀</span>
          {t('filters.basketball')}
        </button>
        <button
          className={`discover-filter-btn ${sportFilter === '5' ? 'active' : ''}`}
          onClick={() => {
            setSportFilter('5');
            setAmericanFootballSubFilter('all');
          }}
        >
          <span className="filter-icon">🏈</span>
          {t('filters.americanFootball')}
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

      {sportFilter === '3' && (
        <div className="discover-sub-filters">
          <div className="discover-sub-row">
            <button className={`discover-filter-btn discover-sub-btn ${baseballSubFilter === 'all' ? 'active' : ''}`} onClick={() => setBaseballSubFilter('all')}>
              {t('filters.all')}
            </button>
            <button className={`discover-filter-btn discover-sub-btn discover-sub-mlb ${baseballSubFilter === 'MLB' ? 'active' : ''}`} onClick={() => setBaseballSubFilter('MLB')}>
              {t('filters.mlb')}
            </button>
            <button className={`discover-filter-btn discover-sub-btn discover-sub-kbo ${baseballSubFilter === 'KBO' ? 'active' : ''}`} onClick={() => setBaseballSubFilter('KBO')}>
              {t('filters.kbo')}
            </button>
          </div>
        </div>
      )}

      {sportFilter === '4' && (
        <div className="discover-sub-filters">
          <div className="discover-sub-row">
            <button className={`discover-filter-btn discover-sub-btn ${basketballSubFilter === 'all' ? 'active' : ''}`} onClick={() => setBasketballSubFilter('all')}>
              {t('filters.all')}
            </button>
            <button className={`discover-filter-btn discover-sub-btn ${basketballSubFilter === 'NBA' ? 'active' : ''}`} onClick={() => setBasketballSubFilter('NBA')}>
              {t('filters.nba')}
            </button>
          </div>
        </div>
      )}

      {sportFilter === '5' && (
        <div className="discover-sub-filters">
          <div className="discover-sub-row">
            <button className={`discover-filter-btn discover-sub-btn ${americanFootballSubFilter === 'all' ? 'active' : ''}`} onClick={() => setAmericanFootballSubFilter('all')}>
              {t('filters.all')}
            </button>
            <button className={`discover-filter-btn discover-sub-btn ${americanFootballSubFilter === 'NFL' ? 'active' : ''}`} onClick={() => setAmericanFootballSubFilter('NFL')}>
              {t('filters.nfl')}
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <section className="discover-section">
        <h2 className="discover-section-title">{t('discover.upcomingEvents')}</h2>
        <div className="upcoming-scroll">
          {isWipSportSelected ? (
            <div className="discover-loading">Work in progress</div>
          ) : isLoading ? (
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
                className={`upcoming-card ${getEventAccent(event)}`}
                onClick={() => setSelectedUpcomingEvent(event)}
              >
                <div className="upcoming-card-league">{event.competition}</div>
                <div className="upcoming-card-date">
                  {format(parseISO(event.datetime_utc), 'MMM d')}
                </div>
                <div className="upcoming-card-title">{event.title}</div>
                <div className="upcoming-card-venue">{event.venue}</div>
                <div className="upcoming-card-time">
                  {formatPreferenceTime(parseISO(event.datetime_utc), use24HourTime)}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* What's On This Month */}
      <section className="discover-section">
        <h2 className="discover-section-title">{t('discover.whatsLeftThisMonth')}</h2>
        <div className="sports-scroll">
          {shuffledLeaguesThisMonth.length === 0 ? (
            <div className="discover-loading">{t('discover.noData')}</div>
          ) : (
            shuffledLeaguesThisMonth.map(comp => (
              <div key={comp.name} className={`competition-card ${comp.accent}`} onClick={() => setSelectedLeagueName(comp.name)}>
                <div className="competition-icon">{comp.icon}</div>
                <div className="competition-name">{comp.name}</div>
                <div className="competition-count">{t('discover.events', { count: comp.eventCount })}</div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recently Updated */}
      <section className="discover-section">
        <h2 className="discover-section-title">{t('discover.recentlyUpdated')}</h2>
        <div className="recently-updated-list">
          {recentlyUpdated.map(sport => (
            <div key={sport.id} className="recently-updated-row non-clickable">
              <div className="recently-updated-icon">{sport.icon}</div>
              <div className="recently-updated-info">
                <div className="recently-updated-name">{sport.name}</div>
                <div className="recently-updated-count">{sport.lastUpdatedLabel}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {selectedUpcomingEvent && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedUpcomingEvent(null)} />
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className={`modal-sport-badge ${getCalendarThemeClass(selectedUpcomingEvent)}`}>
                {selectedUpcomingEvent.competition}
              </div>
              <button className="modal-close" onClick={() => setSelectedUpcomingEvent(null)}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <h2 className="modal-title">{selectedUpcomingEvent.title}</h2>
            {(selectedUpcomingEvent.home_team_name || selectedUpcomingEvent.away_team_name) && (
              <div className="modal-score">
                {selectedUpcomingEvent.home_team_name && (
                  <div className="modal-score-team">
                    <span className="modal-score-initials">{getTeamInitials(selectedUpcomingEvent.home_team_name)}</span>
                    <span className="modal-score-name">{selectedUpcomingEvent.home_team_name}</span>
                    {!hideScores && selectedUpcomingEvent.home_score != null && <span className="modal-score-value">{selectedUpcomingEvent.home_score}</span>}
                  </div>
                )}
                {selectedUpcomingEvent.away_team_name && (
                  <div className="modal-score-team">
                    <span className="modal-score-initials">{getTeamInitials(selectedUpcomingEvent.away_team_name)}</span>
                    <span className="modal-score-name">{selectedUpcomingEvent.away_team_name}</span>
                    {!hideScores && selectedUpcomingEvent.away_score != null && <span className="modal-score-value">{selectedUpcomingEvent.away_score}</span>}
                  </div>
                )}
              </div>
            )}
            <div className="modal-details">
              <div className="detail-row">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15.833 3.333H4.167C3.247 3.333 2.5 4.08 2.5 5v11.667c0 .92.746 1.666 1.667 1.666h11.666c.92 0 1.667-.746 1.667-1.666V5c0-.92-.746-1.667-1.667-1.667zM13.333 1.667V5M6.667 1.667V5M2.5 8.333h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{format(parseISO(selectedUpcomingEvent.datetime_utc), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="detail-row">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 5v5l3.333 1.667M17.5 10a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{formatPreferenceTime(parseISO(selectedUpcomingEvent.datetime_utc), use24HourTime)}</span>
              </div>
              <div className="detail-row">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 10.833a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.25 8.333c0 5.417-6.25 9.584-6.25 9.584s-6.25-4.167-6.25-9.584a6.25 6.25 0 1112.5 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{selectedUpcomingEvent.venue}</span>
              </div>
            </div>
          </div>
        </>
      )}
      {selectedLeagueName && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedLeagueName(null)} />
          <div className="modal discover-league-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className={`modal-sport-badge ${selectedLeagueAccent === 'pl' ? 'premier-league' : selectedLeagueAccent === 'ucl' ? 'champions-league' : selectedLeagueAccent === 'laliga' ? 'la-liga' : selectedLeagueAccent === 'bundesliga' ? 'bundesliga' : selectedLeagueAccent === 'seriea' ? 'serie-a' : selectedLeagueAccent === 'ligue1' ? 'ligue-1' : selectedLeagueAccent === 'europa' ? 'europa-league' : selectedLeagueAccent === 'conference' ? 'conference-league' : selectedLeagueAccent === 'f1' ? 'formula-one' : selectedLeagueAccent}`}>
                {selectedLeagueName}
              </div>
              <button className="modal-close" onClick={() => setSelectedLeagueName(null)}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <h2 className="modal-title">{t('discover.gamesLeftThisMonth')}</h2>
            {selectedLeagueGames.length === 0 ? (
              <div className="discover-loading">{t('discover.noData')}</div>
            ) : (
              <div className="discover-league-games-list scrollable">
                {selectedLeagueGames.map((event) => (
                  <div key={event.id} className="discover-league-game-row">
                    <div className="discover-league-game-date">
                      <div className="discover-league-game-date-month">{format(parseISO(event.datetime_utc), 'MMM')}</div>
                      <div className="discover-league-game-date-day">{format(parseISO(event.datetime_utc), 'd')}</div>
                    </div>
                    <div className="discover-league-game-content">
                      <div className="discover-league-game-title">{event.title}</div>
                      <div className="discover-league-game-meta">
                        <span>{formatPreferenceTime(parseISO(event.datetime_utc), use24HourTime)}</span>
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
