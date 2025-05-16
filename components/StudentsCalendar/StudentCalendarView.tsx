import React from 'react';
import CalendarView from '../TeachersCalendar/CalendarView';
import { Class } from '../TeachersCalendar/types';

const StudentCalendarView: React.FC<{ schedule?: Class[]; onScheduleUpdate?: () => void }> = ({ schedule = [], onScheduleUpdate }) => {
  return (
    <div className="rounded-3xl shadow-2xl p-4 overflow-x-auto min-h-[520px] bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] border border-[#e0e0e0] w-full max-w-5xl mx-auto">
      {/* Solo el calendario central, sin paneles laterales ni derecho */}
      <CalendarView classes={schedule} onClassClick={() => {}} onScheduleUpdate={onScheduleUpdate} hideSidebars={true} />
    </div>
  );
};

export default StudentCalendarView; 