import React from 'react';
import CalendarView from './CalendarView';
import type { Class } from './CalendarView';

const TeachersCalendar: React.FC<{ schedule?: Class[] }> = ({ schedule = [] }) => {
  // Placeholder for real-time sync and double booking logic
  return (
    <div>
      <CalendarView classes={schedule} onClassClick={() => {}} />
    </div>
  );
};

export default TeachersCalendar; 