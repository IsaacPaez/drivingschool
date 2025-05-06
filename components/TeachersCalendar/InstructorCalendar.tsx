import React from 'react';
import CalendarView from './CalendarView';

const InstructorCalendar: React.FC<{ schedule?: any[]; onScheduleUpdate?: () => void }> = ({ schedule = [], onScheduleUpdate }) => {
  console.log('Schedule recibido en InstructorCalendar:', schedule);
  // Placeholder for real-time sync and double booking logic
  return (
    <div>
      <CalendarView schedule={schedule} onScheduleUpdate={onScheduleUpdate} />
    </div>
  );
};

export default InstructorCalendar; 