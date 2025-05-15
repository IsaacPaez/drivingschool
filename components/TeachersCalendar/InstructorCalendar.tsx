import React from 'react';
import CalendarView from './CalendarView';
import type { Class } from './CalendarView';

const InstructorCalendar: React.FC<{ 
  schedule?: Class[]; 
  onScheduleUpdate?: () => void; 
  studentMode?: boolean 
}> = ({ schedule = [], onScheduleUpdate, studentMode }) => {
  // Si es modo estudiante, solo muestra el calendario central y el mensaje
  if (studentMode) {
    return (
      <div className="rounded-3xl shadow-2xl p-4 overflow-x-auto min-h-[520px] bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] border border-[#e0e0e0] w-full max-w-5xl mx-auto">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-[#0056b3] text-center text-lg font-semibold">
          Visualiza los espacios libres y agenda tu clase en uno de ellos.<br />No puedes editar ni cancelar reservas.
        </div>
        <CalendarView classes={schedule} onScheduleUpdate={onScheduleUpdate} onClassClick={() => {}} />
      </div>
    );
  }
  // Modo instructor (por defecto)
  return (
    <div>
      <CalendarView classes={schedule} onScheduleUpdate={onScheduleUpdate} onClassClick={() => {}} />
    </div>
  );
};

export default InstructorCalendar; 