import { useState, useEffect, useRef, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { mockEvents, getTeamInitials } from '../utils/mockData';
import { FOOTBALL_LEAGUES, useLeagueEvents, useLeagueTeams, usePLEvents, useUCLEvents } from '../hooks/useFootballData';
import { useF1Events } from '../hooks/useF1Data';
import type { SportsEvent, Team } from '../types';
import { Link, useLocation } from 'react-router-dom';
import './CalendarPage.css';

const F1_SELECTION_ID = 'f1';
const LEGACY_F1_SELECTION_IDS = new Set(['11', '12', '13', '14', '15']);

function uniqueTeamsById(teams: Team[]): Team[] {
  const byId = new Map<string, Team>();
  for (const team of teams) {
    if (!byId.has(team.id)) {
      byId.set(team.id, team);
    }
  }
  return Array.from(byId.values());
}

function getEventThemeClass(event: SportsEvent): 'premier-league' | 'champions-league' | 'la-liga' | 'bundesliga' | 'serie-a' | 'ligue-1' | 'europa-league' | 'formula-one' {
  if (event.sport_id === '2') return 'formula-one';
  const competition = event.competition.toLowerCase();
  if (competition.includes('champions')) return 'champions-league';
  if (competition.includes('europa')) return 'europa-league';
  if (competition.includes('la liga')) return 'la-liga';
  if (competition.includes('bundesliga')) return 'bundesliga';
  if (competition.includes('serie a')) return 'serie-a';
  if (competition.includes('ligue 1')) return 'ligue-1';
  return 'premier-league';
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedTeams');
    if (!saved) return [];
    const parsed: string[] = JSON.parse(saved);
    const normalized = Array.from(new Set(parsed.map((id) => (
      LEGACY_F1_SELECTION_IDS.has(id) ? F1_SELECTION_ID : id
    ))));
    if (normalized.join(',') !== parsed.join(',')) {
      localStorage.setItem('selectedTeams', JSON.stringify(normalized));
    }
    return normalized;
  });
  const hasSelectedTeams = selectedTeams.length > 0;

  // Fetch live football events
  const plEvents = usePLEvents();
  const uclEvents = useUCLEvents();
  const laLigaEvents = useLeagueEvents(FOOTBALL_LEAGUES.laLiga.id);
  const bundesligaEvents = useLeagueEvents(FOOTBALL_LEAGUES.bundesliga.id);
  const serieAEvents = useLeagueEvents(FOOTBALL_LEAGUES.serieA.id);
  const ligue1Events = useLeagueEvents(FOOTBALL_LEAGUES.ligue1.id);
  const plTeams = useLeagueTeams(FOOTBALL_LEAGUES.premierLeague.id);
  const uclTeams = useLeagueTeams(FOOTBALL_LEAGUES.championsLeague.id);
  const laLigaTeams = useLeagueTeams(FOOTBALL_LEAGUES.laLiga.id);
  const bundesligaTeams = useLeagueTeams(FOOTBALL_LEAGUES.bundesliga.id);
  const serieATeams = useLeagueTeams(FOOTBALL_LEAGUES.serieA.id);
  const ligue1Teams = useLeagueTeams(FOOTBALL_LEAGUES.ligue1.id);
  const f1EventsQuery = useF1Events();

  const isLoading = plEvents.isLoading || uclEvents.isLoading || laLigaEvents.isLoading || bundesligaEvents.isLoading || serieAEvents.isLoading || ligue1Events.isLoading || f1EventsQuery.isLoading;
  const hasError = plEvents.error && uclEvents.error && laLigaEvents.error && bundesligaEvents.error && serieAEvents.error && ligue1Events.error;

  const fallbackF1Events = useMemo(() => mockEvents.filter(e => e.sport_id === '2'), []);
  const f1Events = (f1EventsQuery.data && f1EventsQuery.data.length > 0)
    ? f1EventsQuery.data
    : fallbackF1Events;

  // Merge API football events with F1 mock events
  const allEvents = useMemo(() => {
    const footballEvents = [
      ...(plEvents.data ?? []),
      ...(uclEvents.data ?? []),
      ...(laLigaEvents.data ?? []),
      ...(bundesligaEvents.data ?? []),
      ...(serieAEvents.data ?? []),
      ...(ligue1Events.data ?? []),
    ];

    return [...footballEvents, ...f1Events];
  }, [plEvents.data, uclEvents.data, laLigaEvents.data, bundesligaEvents.data, serieAEvents.data, ligue1Events.data, f1Events]);

  const allTeams = useMemo<Team[]>(() => {
    const toTeam = (id: string | undefined, name: string | undefined, league: string): Team | null => {
      if (!id || !name) return null;
      return {
        id,
        sport_id: '1',
        name,
        external_api_id: id,
        league,
      };
    };

    const eventDerivedFootballTeams = [
      ...(plEvents.data ?? []).flatMap((event) => ([
        toTeam(event.home_team_id, event.home_team_name, 'Premier League'),
        toTeam(event.away_team_id, event.away_team_name, 'Premier League'),
      ])),
      ...(uclEvents.data ?? []).flatMap((event) => ([
        toTeam(event.home_team_id, event.home_team_name, 'Champions League'),
        toTeam(event.away_team_id, event.away_team_name, 'Champions League'),
      ])),
      ...(laLigaEvents.data ?? []).flatMap((event) => ([
        toTeam(event.home_team_id, event.home_team_name, 'La Liga'),
        toTeam(event.away_team_id, event.away_team_name, 'La Liga'),
      ])),
      ...(bundesligaEvents.data ?? []).flatMap((event) => ([
        toTeam(event.home_team_id, event.home_team_name, 'Bundesliga'),
        toTeam(event.away_team_id, event.away_team_name, 'Bundesliga'),
      ])),
      ...(serieAEvents.data ?? []).flatMap((event) => ([
        toTeam(event.home_team_id, event.home_team_name, 'Serie A'),
        toTeam(event.away_team_id, event.away_team_name, 'Serie A'),
      ])),
      ...(ligue1Events.data ?? []).flatMap((event) => ([
        toTeam(event.home_team_id, event.home_team_name, 'Ligue 1'),
        toTeam(event.away_team_id, event.away_team_name, 'Ligue 1'),
      ])),
    ].filter((team): team is Team => Boolean(team));

    const footballTeams = [
      ...(plTeams.data ?? []),
      ...(uclTeams.data ?? []),
      ...(laLigaTeams.data ?? []),
      ...(bundesligaTeams.data ?? []),
      ...(serieATeams.data ?? []),
      ...(ligue1Teams.data ?? []),
      ...eventDerivedFootballTeams,
    ];
    const f1Teams: Team[] = [{
      id: F1_SELECTION_ID,
      sport_id: '2',
      name: 'Formula 1',
      external_api_id: 'f1',
      league: 'Formula 1',
    }];
    return uniqueTeamsById([...footballTeams, ...f1Teams]);
  }, [
    plTeams.data,
    uclTeams.data,
    laLigaTeams.data,
    bundesligaTeams.data,
    serieATeams.data,
    ligue1Teams.data,
    plEvents.data,
    uclEvents.data,
    laLigaEvents.data,
    bundesligaEvents.data,
    serieAEvents.data,
    ligue1Events.data,
  ]);

  // Get selected team objects for avatar chips
  const selectedTeamObjects = allTeams.filter(t => selectedTeams.includes(t.id));

  // Filter events by selected teams
  let filteredEvents = selectedTeams.length > 0
    ? allEvents.filter(event => {
        if (event.home_team_id || event.away_team_id) {
          return selectedTeams.includes(event.home_team_id || '') ||
                 selectedTeams.includes(event.away_team_id || '');
        }
        if (event.sport_id === '2') {
          return selectedTeams.some(teamId => {
            const team = allTeams.find(t => t.id === teamId);
            return team && team.sport_id === '2';
          });
        }
        return false;
      })
    : [];

  // Sort all events ascending
  filteredEvents = [...filteredEvents].sort((a, b) => {
    const dateA = parseISO(a.datetime_utc).getTime();
    const dateB = parseISO(b.datetime_utc).getTime();
    return dateA - dateB;
  });

  // Find the today marker insertion point
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Group events by date
  const groupedEvents: { [key: string]: SportsEvent[] } = {};
  filteredEvents.forEach(event => {
    const dateKey = format(parseISO(event.datetime_utc), 'yyyy-MM-dd');
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(event);
  });

  const getTeamDisplay = (event: SportsEvent, which: 'home' | 'away') => {
    const teamId = which === 'home' ? event.home_team_id : event.away_team_id;
    const teamName = which === 'home' ? event.home_team_name : event.away_team_name;

    // Try mock teams first (for fallback/F1)
    if (teamId) {
      const mockTeam = allTeams.find(team => team.id === teamId);
      if (mockTeam) return { name: mockTeam.name, initials: getTeamInitials(mockTeam.name) };
    }

    // Use API team name from event
    if (teamName) {
      return { name: teamName, initials: getTeamInitials(teamName) };
    }

    return null;
  };

  const hasTodayEvents = !!groupedEvents[todayStr];

  const todayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const saved = localStorage.getItem('selectedTeams');
    const parsed: string[] = saved ? JSON.parse(saved) : [];
    const normalized = Array.from(new Set(parsed.map((id) => (
      LEGACY_F1_SELECTION_IDS.has(id) ? F1_SELECTION_ID : id
    ))));
    setSelectedTeams(normalized);
  }, [location.pathname]);

  useEffect(() => {
    todayRef.current?.scrollIntoView({ block: 'center' });
  }, [isLoading]);

  // Track months for separators and today marker insertion
  let lastMonth = '';
  let todayMarkerInserted = false;

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">{t('calendar.title')}</h1>
        </div>
      </header>

      {/* Team Avatar Chips — shows which teams are filtering the calendar */}
      <div className="team-chips-bar">
        <div className="team-chips-row">
          {selectedTeamObjects.length > 0
            ? selectedTeamObjects.map(team => (
                <div key={team.id} className="team-chip" title={team.name}>
                  <span className="team-chip-initials">{getTeamInitials(team.name)}</span>
                </div>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <Link key={i} to="/teams" className="team-chip empty-chip" />
              ))
          }
          <Link to="/teams" className="team-chip add-chip">
            <span>+</span>
          </Link>
        </div>
      </div>

      {/* Events List */}
      <main className="events-list">
        {isLoading ? (
          <div className="calendar-loading">
            <span className="loading-with-spinner">
              <span className="loading-spinner" aria-hidden="true" />
              <span>Loading events...</span>
            </span>
          </div>
        ) : hasError ? (
          <div className="calendar-error">
            <p>Couldn't load football events</p>
            <button onClick={() => { plEvents.refetch(); uclEvents.refetch(); }} className="retry-btn">Retry</button>
          </div>
        ) : !hasSelectedTeams ? (
          <div className="calendar-empty-selection">
            <p>Select teams to see your schedule</p>
            <Link to="/teams" className="calendar-select-teams-btn">Choose teams</Link>
          </div>
        ) : Object.keys(groupedEvents).length === 0 ? (
          <div className="no-events-message">
            <p>{t('calendar.noEvents')}</p>
            <span>{t('calendar.noEventsSub')}</span>
          </div>
        ) : (
          Object.keys(groupedEvents).map((dateKey) => {
            const eventsForDate = groupedEvents[dateKey];
            const date = parseISO(dateKey);
            const dayOfWeek = format(date, 'EEE').toUpperCase();
            const dayNumber = format(date, 'd');
            const currentMonth = format(date, 'MMMM');
            const showMonthSeparator = currentMonth !== lastMonth;
            lastMonth = currentMonth;
            const isDateToday = dateKey === todayStr;

            // Insert today marker before the first future date if no events today
            const insertTodayMarkerBefore = !todayMarkerInserted && !hasTodayEvents && dateKey > todayStr;
            if (insertTodayMarkerBefore) todayMarkerInserted = true;

            return (
              <div key={dateKey}>
                {insertTodayMarkerBefore && (
                  <div ref={todayRef} className="today-marker">
                    <div className="today-marker-line" />
                    <span className="today-marker-label">{t('calendar.today')}</span>
                    <div className="today-marker-line" />
                    <div className="today-no-games">{t('calendar.noGamesToday')}</div>
                  </div>
                )}
                {showMonthSeparator && (
                  <div className="month-separator">{currentMonth}</div>
                )}
                {isDateToday && (
                  <div ref={todayRef} className="today-marker">
                    <div className="today-marker-line" />
                    <span className="today-marker-label">{t('calendar.today')}</span>
                    <div className="today-marker-line" />
                  </div>
                )}
                <div className="date-group">
                  <div className="date-badge">
                    <div className="date-day">{dayOfWeek}</div>
                    <div className="date-number">{dayNumber}</div>
                  </div>

                  <div className="events-for-date">
                    {eventsForDate.map((event, index) => {
                      const homeDisplay = getTeamDisplay(event, 'home');
                      const awayDisplay = getTeamDisplay(event, 'away');
                      const eventDate = parseISO(event.datetime_utc);
                      const time = format(eventDate, 'HH:mm');
                      const isPast = dateKey < todayStr;

                      const eventThemeClass = getEventThemeClass(event);
                      return (
                        <div
                          key={event.id}
                          className={`event-card ${eventThemeClass} ${isPast ? 'past-event' : ''}`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          {eventsForDate.length > 1 && (
                            <div className="event-counter">{index + 1} {t('calendar.of')} {eventsForDate.length}</div>
                          )}

                          <div className="event-card-content">
                            <div className="event-time">{isPast ? t('calendar.ft') : time}</div>
                            <div className="event-teams">
                              {homeDisplay && (
                                <div className="team-info">
                                  <span className="team-initials-badge">{homeDisplay.initials}</span>
                                  <span className="team-name">{homeDisplay.name}</span>
                                  {isPast && event.home_score != null && (
                                    <span className="team-score">{event.home_score}</span>
                                  )}
                                </div>
                              )}
                              {awayDisplay && (
                                <div className="team-info">
                                  <span className="team-initials-badge">{awayDisplay.initials}</span>
                                  <span className="team-name">{awayDisplay.name}</span>
                                  {isPast && event.away_score != null && (
                                    <span className="team-score">{event.away_score}</span>
                                  )}
                                </div>
                              )}
                              {!homeDisplay && !awayDisplay && (
                                <div className="event-title-only">{event.title}</div>
                              )}
                            </div>
                            <div className="event-competition">{event.competition}</div>
                          </div>

                          {isPast && event.result && (
                            <div className="event-result">
                              {event.result.split('  ').map((line, i) => (
                                <div key={i} className="result-line">
                                  <span className="result-position">{line.split('. ')[0]}.</span>
                                  <span className="result-name">{line.split('. ')[1]}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="event-card-pattern"></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Event Modal */}
      {selectedEvent && (() => {
        const isEventPast = format(parseISO(selectedEvent.datetime_utc), 'yyyy-MM-dd') < todayStr;
        const homeDisplay = getTeamDisplay(selectedEvent, 'home');
        const awayDisplay = getTeamDisplay(selectedEvent, 'away');
        const selectedEventThemeClass = getEventThemeClass(selectedEvent);
        return (
        <>
          <div className="modal-overlay" onClick={() => setSelectedEvent(null)} />
          <div className="modal">
            <div className="modal-header">
              <div className={`modal-sport-badge ${selectedEventThemeClass}`}>
                {selectedEvent.competition}
              </div>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <h2 className="modal-title">{selectedEvent.title}</h2>

            {isEventPast && selectedEvent.home_score != null && homeDisplay && awayDisplay && (
              <div className="modal-score">
                <div className="modal-score-team">
                  <span className="modal-score-initials">{homeDisplay.initials}</span>
                  <span className="modal-score-name">{homeDisplay.name}</span>
                  <span className="modal-score-value">{selectedEvent.home_score}</span>
                </div>
                <div className="modal-score-team">
                  <span className="modal-score-initials">{awayDisplay.initials}</span>
                  <span className="modal-score-name">{awayDisplay.name}</span>
                  <span className="modal-score-value">{selectedEvent.away_score}</span>
                </div>
              </div>
            )}

            {isEventPast && selectedEvent.result && (
              <div className="modal-standings">
                {selectedEvent.result.split('  ').map((line, i) => (
                  <div key={i} className="modal-standing-row">
                    <span className="modal-standing-pos">{line.split('. ')[0]}.</span>
                    <span className="modal-standing-name">{line.split('. ')[1]}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-details">
              <div className="detail-row">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15.833 3.333H4.167C3.247 3.333 2.5 4.08 2.5 5v11.667c0 .92.746 1.666 1.667 1.666h11.666c.92 0 1.667-.746 1.667-1.666V5c0-.92-.746-1.667-1.667-1.667zM13.333 1.667V5M6.667 1.667V5M2.5 8.333h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{format(parseISO(selectedEvent.datetime_utc), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="detail-row">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 5v5l3.333 1.667M17.5 10a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{isEventPast ? t('calendar.fullTime') : format(parseISO(selectedEvent.datetime_utc), 'h:mm a')}</span>
              </div>
              <div className="detail-row">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 10.833a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.25 8.333c0 5.417-6.25 9.584-6.25 9.584s-6.25-4.167-6.25-9.584a6.25 6.25 0 1112.5 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{selectedEvent.venue}</span>
              </div>
              <div className="detail-row">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M16.667 17.5v-1.667a3.333 3.333 0 00-3.334-3.333H6.667a3.333 3.333 0 00-3.334 3.333V17.5M10 9.167A3.333 3.333 0 1010 2.5a3.333 3.333 0 000 6.667z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>{selectedEvent.competition}</span>
              </div>
            </div>
          </div>
        </>
        );
      })()}
    </div>
  );
}
