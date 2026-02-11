import { useState } from 'react';
import { format, parseISO, isToday, isFuture, isPast } from 'date-fns';
import { mockEvents, mockTeams, getTeamInitials } from '../utils/mockData';
import type { SportsEvent } from '../types';
import { Link } from 'react-router-dom';
import './CalendarPage.css';

type ViewMode = 'next' | 'past' | 'all';

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('next');
  const [selectedTeams] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedTeams');
    return saved ? JSON.parse(saved) : [];
  });

  // Get selected team objects for avatar chips
  const selectedTeamObjects = mockTeams.filter(t => selectedTeams.includes(t.id));

  // Filter events by selected teams
  let filteredEvents = selectedTeams.length > 0
    ? mockEvents.filter(event => {
        if (event.home_team_id || event.away_team_id) {
          return selectedTeams.includes(event.home_team_id || '') ||
                 selectedTeams.includes(event.away_team_id || '');
        }
        if (event.sport_id === '2') {
          return selectedTeams.some(teamId => {
            const team = mockTeams.find(t => t.id === teamId);
            return team && team.sport_id === '2';
          });
        }
        return false;
      })
    : mockEvents;

  // Filter by time
  if (viewMode === 'next') {
    filteredEvents = filteredEvents.filter(event => {
      const eventDate = parseISO(event.datetime_utc);
      return isFuture(eventDate) || isToday(eventDate);
    });
  } else if (viewMode === 'past') {
    filteredEvents = filteredEvents.filter(event => {
      const eventDate = parseISO(event.datetime_utc);
      return isPast(eventDate) && !isToday(eventDate);
    });
  }

  // Sort events
  filteredEvents = [...filteredEvents].sort((a, b) => {
    const dateA = parseISO(a.datetime_utc).getTime();
    const dateB = parseISO(b.datetime_utc).getTime();
    return viewMode === 'past' ? dateB - dateA : dateA - dateB;
  });

  // Group events by date
  const groupedEvents: { [key: string]: SportsEvent[] } = {};
  filteredEvents.forEach(event => {
    const dateKey = format(parseISO(event.datetime_utc), 'yyyy-MM-dd');
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(event);
  });

  const getTeamInfo = (teamId: string | null | undefined) => {
    if (!teamId) return null;
    return mockTeams.find(team => team.id === teamId);
  };

  // Track months for separators
  let lastMonth = '';

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">Scalendar</h1>
        </div>
      </header>

      {/* Team Avatar Chips — shows which teams are filtering the calendar */}
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

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button className={`tab-btn ${viewMode === 'next' ? 'active' : ''}`} onClick={() => setViewMode('next')}>Next</button>
        <button className={`tab-btn ${viewMode === 'past' ? 'active' : ''}`} onClick={() => setViewMode('past')}>Past</button>
        <button className={`tab-btn ${viewMode === 'all' ? 'active' : ''}`} onClick={() => setViewMode('all')}>All</button>
      </div>

      {/* Events List */}
      <main className="events-list">
        {Object.keys(groupedEvents).length === 0 ? (
          <div className="no-events-message">
            <p>No events to display</p>
            <span>Try adding teams or check back later</span>
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

            return (
              <div key={dateKey}>
                {showMonthSeparator && (
                  <div className="month-separator">{currentMonth}</div>
                )}
                <div className="date-group">
                  <div className="date-badge">
                    <div className="date-day">{dayOfWeek}</div>
                    <div className="date-number">{dayNumber}</div>
                  </div>

                  <div className="events-for-date">
                    {eventsForDate.map((event, index) => {
                      const homeTeam = getTeamInfo(event.home_team_id);
                      const awayTeam = getTeamInfo(event.away_team_id);
                      const eventDate = parseISO(event.datetime_utc);
                      const time = format(eventDate, 'HH:mm');

                      return (
                        <div
                          key={event.id}
                          className={`event-card ${event.sport_id === '1' ? 'premier-league' : 'formula-one'}`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          {eventsForDate.length > 1 && (
                            <div className="event-counter">{index + 1} of {eventsForDate.length}</div>
                          )}

                          <div className="event-card-content">
                            <div className="event-time">{time}</div>
                            <div className="event-teams">
                              {homeTeam && (
                                <div className="team-info">
                                  <span className="team-initials-badge">{getTeamInitials(homeTeam.name)}</span>
                                  <span className="team-name">{homeTeam.name}</span>
                                </div>
                              )}
                              {awayTeam && (
                                <div className="team-info">
                                  <span className="team-initials-badge">{getTeamInitials(awayTeam.name)}</span>
                                  <span className="team-name">{awayTeam.name}</span>
                                </div>
                              )}
                              {!homeTeam && !awayTeam && (
                                <div className="event-title-only">{event.title}</div>
                              )}
                            </div>
                            <div className="event-competition">{event.competition}</div>
                          </div>

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
      {selectedEvent && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedEvent(null)} />
          <div className="modal">
            <div className="modal-header">
              <div className={`modal-sport-badge ${selectedEvent.sport_id === '1' ? 'premier-league' : 'formula-one'}`}>
                {selectedEvent.sport_id === '1' ? 'Premier League' : 'Formula 1'}
              </div>
              <button className="modal-close" onClick={() => setSelectedEvent(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <h2 className="modal-title">{selectedEvent.title}</h2>
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
                <span>{format(parseISO(selectedEvent.datetime_utc), 'h:mm a')}</span>
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
      )}
    </div>
  );
}
