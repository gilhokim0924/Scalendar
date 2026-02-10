import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { mockEvents, mockTeams } from '../utils/mockData';
import type { SportsEvent } from '../types';
import './CalendarPage.css';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<SportsEvent | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedTeams');
    return saved ? JSON.parse(saved) : [];
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Filter events by selected teams
  const filteredEvents = selectedTeams.length > 0
    ? mockEvents.filter(event => {
        // For Premier League, check home and away teams
        if (event.home_team_id || event.away_team_id) {
          return selectedTeams.includes(event.home_team_id || '') ||
                 selectedTeams.includes(event.away_team_id || '');
        }
        // For F1, show all races if any F1 team is selected
        if (event.sport_id === '2') {
          return selectedTeams.some(teamId => {
            const team = mockTeams.find(t => t.id === teamId);
            return team && team.sport_id === '2';
          });
        }
        return false;
      })
    : mockEvents;

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter((event) =>
      isSameDay(parseISO(event.datetime_utc), day)
    );
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="app-title">Scalendar</h1>
          <p className="app-subtitle">Your Sports Calendar</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">

        {/* Calendar Header */}
        <div className="calendar-header">
          <h2 className="calendar-month">{format(currentDate, 'MMMM yyyy')}</h2>
          <div className="calendar-nav">
            <button className="nav-btn" onClick={goToPreviousMonth}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="nav-btn" onClick={() => setCurrentDate(new Date())}>
              Today
            </button>
            <button className="nav-btn" onClick={goToNextMonth}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="calendar-container">
          {/* Day Names */}
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="day-name">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day) => {
              const events = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              const inCurrentMonth = isCurrentMonth(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`calendar-day ${!inCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                >
                  <div className="day-number">
                    {format(day, 'd')}
                  </div>
                  <div className="events-container">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`event-badge ${event.sport_id === '1' ? 'premier-league' : 'formula-one'}`}
                      >
                        <span className="event-time">{format(parseISO(event.datetime_utc), 'HH:mm')}</span>
                        <span className="event-title">{event.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
