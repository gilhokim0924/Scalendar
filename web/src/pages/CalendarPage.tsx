import { useState, useEffect, useRef, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { mockEvents, mockTeams, getTeamInitials } from '../utils/mockData';
import { usePLEvents, useUCLEvents } from '../hooks/useFootballData';
import { useF1Events } from '../hooks/useF1Data';
import type { SportsEvent } from '../types';
import { Link } from 'react-router-dom';
import './CalendarPage.css';

export default function CalendarPage() {
  const { t } = useTranslation();
  const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);
  const [selectedTeams] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedTeams');
    return saved ? JSON.parse(saved) : [];
  });

  // Fetch live football events
  const plEvents = usePLEvents();
  const uclEvents = useUCLEvents();
  const f1EventsQuery = useF1Events();

  const isLoading = plEvents.isLoading || uclEvents.isLoading || f1EventsQuery.isLoading;
  const hasError = plEvents.error && uclEvents.error;

  const fallbackF1Events = useMemo(() => mockEvents.filter(e => e.sport_id === '2'), []);
  const f1Events = (f1EventsQuery.data && f1EventsQuery.data.length > 0)
    ? f1EventsQuery.data
    : fallbackF1Events;

  // Merge API football events with F1 mock events
  const allEvents = useMemo(() => {
    const footballEvents = [
      ...(plEvents.data ?? []),
      ...(uclEvents.data ?? []),
    ];

    return [...footballEvents, ...f1Events];
  }, [plEvents.data, uclEvents.data, f1Events]);

  // Build a lookup for API teams by ID (for team chip display)
  const allTeams = useMemo(() => {
    // For API events, we have team names embedded in events
    // For F1/fallback, we use mockTeams
    return mockTeams;
  }, []);

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
    : allEvents;

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
          <div className="calendar-loading">Loading events...</div>
        ) : hasError ? (
          <div className="calendar-error">
            <p>Couldn't load football events</p>
            <button onClick={() => { plEvents.refetch(); uclEvents.refetch(); }} className="retry-btn">Retry</button>
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

                      return (
                        <div
                          key={event.id}
                          className={`event-card ${event.sport_id === '1' ? 'premier-league' : 'formula-one'} ${isPast ? 'past-event' : ''}`}
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
        return (
        <>
          <div className="modal-overlay" onClick={() => setSelectedEvent(null)} />
          <div className="modal">
            <div className="modal-header">
              <div className={`modal-sport-badge ${selectedEvent.sport_id === '1' ? 'premier-league' : 'formula-one'}`}>
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
