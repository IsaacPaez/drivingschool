import React from 'react';
import CalendarView from './CalendarView';

const InstructorCalendar: React.FC<{ schedule?: any[] }> = ({ schedule = [] }) => {
  // Placeholder for real-time sync and double booking logic
  return (
    <div>
      <CalendarView schedule={schedule} />
    </div>
  );
};

export default InstructorCalendar; 