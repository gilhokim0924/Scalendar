import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { mockEvents } from '../utils/mockData';
import { Event } from '../types';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDay = (day: Date) => {
    return mockEvents.filter((event) =>
      isSameDay(parseISO(event.datetime_utc), day)
    );
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1>Scalendar</h1>
        <p>Your Premier League & Formula 1 Calendar</p>
      </header>

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{format(currentDate, 'MMMM yyyy')}</h2>
        <div>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
            Previous
          </button>
          <button onClick={() => setCurrentDate(new Date())} style={{ margin: '0 10px' }}>
            Today
          </button>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
            Next
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '10px',
          marginBottom: '20px',
        }}
      >
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} style={{ fontWeight: 'bold', textAlign: 'center', padding: '10px' }}>
            {day}
          </div>
        ))}

        {daysInMonth.map((day) => {
          const events = getEventsForDay(day);
          return (
            <div
              key={day.toISOString()}
              style={{
                border: '1px solid #ddd',
                padding: '10px',
                minHeight: '100px',
                backgroundColor: events.length > 0 ? '#f0f8ff' : 'white',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {format(day, 'd')}
              </div>
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  style={{
                    fontSize: '12px',
                    padding: '4px',
                    marginBottom: '4px',
                    backgroundColor: event.sport_id === '1' ? '#4CAF50' : '#FF5722',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {format(parseISO(event.datetime_utc), 'HH:mm')} {event.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {selectedEvent && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            maxWidth: '500px',
            width: '90%',
          }}
        >
          <h2>{selectedEvent.title}</h2>
          <p><strong>Date:</strong> {format(parseISO(selectedEvent.datetime_utc), 'PPP p')}</p>
          <p><strong>Venue:</strong> {selectedEvent.venue}</p>
          <p><strong>Competition:</strong> {selectedEvent.competition}</p>
          <button
            onClick={() => setSelectedEvent(null)}
            style={{ marginTop: '20px', padding: '10px 20px' }}
          >
            Close
          </button>
        </div>
      )}

      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: -1,
          }}
        />
      )}
    </div>
  );
}
