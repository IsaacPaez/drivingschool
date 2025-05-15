import React from 'react';
import CalendarView from './CalendarView';
import type { Class } from './CalendarView';

// Adaptador: convierte el schedule de la base de datos al formato de clases para CalendarView
function adaptScheduleToClasses(schedule: Record<string, unknown>[]): Class[] {
  if (!Array.isArray(schedule)) return [];
  // Nueva estructura: cada objeto es un slot
  const result = schedule.map((slot: Record<string, unknown>, idx: number) => ({
    id: slot._id ? String(slot._id) : `${slot.date}_${slot.start}_${slot.end}_${idx}`,
    date: new Date(String(slot.date) + 'T00:00:00'),
    hour: typeof slot.start === 'string' ? parseInt(slot.start.split(':')[0], 10) : 0,
    status: (slot.status === 'canceled' ? 'cancelled' : slot.status || 'free') as Class['status'],
    studentId: slot.studentId as string | undefined,
    instructorId: slot.instructorId as string | undefined,
    start: slot.start as string,
    end: slot.end as string,
    slots: undefined,
  }));
  return result;
}

const InstructorCalendar: React.FC<{ 
  schedule?: unknown[];
  onScheduleUpdate?: () => void; 
  studentMode?: boolean 
}> = ({ schedule = [], onScheduleUpdate, studentMode }) => {
  const classes = adaptScheduleToClasses(schedule as Record<string, unknown>[]);
  // Si es modo estudiante, solo muestra el calendario central y el mensaje
  if (studentMode) {
    return (
      <div className="rounded-3xl shadow-2xl p-4 overflow-x-auto min-h-[520px] bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] border border-[#e0e0e0] w-full max-w-5xl mx-auto">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-[#0056b3] text-center text-lg font-semibold">
          Visualiza los espacios libres y agenda tu clase en uno de ellos.<br />No puedes editar ni cancelar reservas.
        </div>
        <CalendarView classes={classes} onScheduleUpdate={onScheduleUpdate} onClassClick={() => {}} />
      </div>
    );
  }
  // Modo instructor (por defecto)
  return (
    <div>
      <CalendarView classes={classes} onScheduleUpdate={onScheduleUpdate} onClassClick={() => {}} />
    </div>
  );
};

export default InstructorCalendar; 