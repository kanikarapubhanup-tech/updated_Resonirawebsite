import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Video } from 'lucide-react';

const CalendarBooking = () => {
  const [selectedMeeting, setSelectedMeeting] = useState('30m');
  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Kolkata');
  const [currentDate, setCurrentDate] = useState(new Date());

  const meetingOptions = [
    { value: '30m', label: '30 min' },
    { value: '45m', label: '45 min' },
    { value: '60m', label: '60 min' }
  ];

  const timezones = [
    { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
    { value: 'America/New_York', label: 'America/New_York' },
    { value: 'Europe/London', label: 'Europe/London' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo' }
  ];

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const isAvailable = date >= today && isCurrentMonth;

      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isToday,
        isAvailable
      });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="va-right-panel">
      <div className="va-calendar">
        {/* Header */}
        <div className="va-calendar-header">
          {/* Meeting Type Selector */}
          <div className="va-meeting-selector">
            {meetingOptions.map((option) => (
              <button
                key={option.value}
                className={`va-meeting-option ${selectedMeeting === option.value ? 'va-active' : ''}`}
                onClick={() => setSelectedMeeting(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Video Call Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Video size={16} style={{ color: '#6b7280' }} />
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Zoom Video Call</span>
          </div>

          {/* Timezone Selector */}
          <div className="va-timezone-selector">
            <label style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem', display: 'block' }}>
              Timezone
            </label>
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="va-calendar-grid">
          {/* Month Navigation */}
          <div className="va-calendar-nav">
            <button onClick={() => navigateMonth(-1)}>
              <ChevronLeft size={20} />
            </button>
            <span className="va-calendar-month">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button onClick={() => navigateMonth(1)}>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day Headers */}
          <div className="va-calendar-days">
            {dayNames.map((day) => (
              <div
                key={day}
                style={{
                  padding: '0.5rem',
                  textAlign: 'center',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  color: '#6b7280'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="va-calendar-days">
            {generateCalendarDays().map((day, index) => (
              <div
                key={index}
                className={`va-calendar-day ${day.isToday ? 'va-today' : ''
                  } ${day.isAvailable ? 'va-available' : 'va-unavailable'
                  }`}
                style={{
                  opacity: day.isCurrentMonth ? 1 : 0.3
                }}
              >
                {day.day}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarBooking;

