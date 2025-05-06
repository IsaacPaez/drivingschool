import React from 'react';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM'];

// Simulación de bloques por día/hora
const sampleBlocks = [
  // Día, hora, estado
  { day: 0, hour: 0, status: 'scheduled' },
  { day: 1, hour: 1, status: 'free' },
  { day: 2, hour: 2, status: 'canceled' },
  { day: 3, hour: 3, status: 'scheduled' },
  { day: 4, hour: 4, status: 'free' },
];

const statusStyles: Record<string, string> = {
  free: 'bg-[#f3f4f6] text-gray-400 border border-gray-200',
  scheduled: 'bg-[#0056b3] text-white border-0 shadow-lg',
  canceled: 'bg-[#f44336] text-white border-0 shadow-lg',
};

const statusLabel: Record<string, string> = {
  free: '',
  scheduled: 'Scheduled',
  canceled: 'Canceled',
};

const statusIcon: Record<string, React.ReactNode> = {
  free: <HiOutlineClock className="w-5 h-5 text-gray-300" />,
  scheduled: <HiOutlineCheckCircle className="w-5 h-5 text-white" />,
  canceled: <HiOutlineXCircle className="w-5 h-5 text-white" />,
};

type Props = {
  view: 'week' | 'month';
  onTimeBlockClick: (block: any) => void;
  selectedDate: Date;
  classes: any[];
};

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix = [];
  let week: (number | null)[] = [];
  let dayOfWeek = (firstDay.getDay() + 6) % 7; // Monday as first
  for (let i = 0; i < dayOfWeek; i++) week.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(d);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

const CalendarGrid: React.FC<Props> = ({ view, onTimeBlockClick, selectedDate, classes }) => {
  if (view === 'month') {
    const today = selectedDate;
    const matrix = getMonthMatrix(today.getFullYear(), today.getMonth());
    const daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const getStatus = (day: number | null) => {
      if (!day) return 'free';
      const found = classes.find(
        c => c.date.getDate() === day && c.date.getMonth() === today.getMonth() && c.date.getFullYear() === today.getFullYear()
      );
      return found ? found.status : 'free';
    };
    return (
      <div className="rounded-3xl shadow-2xl p-8 overflow-x-auto min-h-[520px] bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] border border-[#e0e0e0]">
        <div className="grid grid-cols-7 gap-2 mb-3 sticky top-0 z-10">
          {daysShort.map((d) => (
            <div key={d} className="text-center font-bold text-[#0056b3] bg-white/80 py-2 rounded-xl shadow text-base tracking-wide uppercase border border-[#e0e0e0]">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {matrix.map((week, i) => (
            <React.Fragment key={i}>
              {week.map((day, j) => {
                const status = getStatus(day);
                return (
                  <button
                    key={j}
                    className={`h-20 w-full rounded-xl font-semibold text-base flex flex-col items-center justify-center gap-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#27ae60] ${statusStyles[status]} ${status !== 'free' ? 'hover:scale-105 hover:shadow-2xl' : 'hover:bg-gray-200'}`}
                    disabled={!day}
                    onClick={() => day && onTimeBlockClick({ day, week: i, status })}
                  >
                    <span className="text-lg font-bold">{day || ''}</span>
                    {status !== 'free' && (
                      <span className="flex items-center gap-1 mt-1">
                        {statusIcon[status]}
                        <span className="text-xs font-bold">{statusLabel[status]}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
  // Vista semanal
  // Calcula el rango de la semana seleccionada (lunes a domingo)
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - ((startOfWeek.getDay() + 6) % 7));
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  return (
    <div className="rounded-3xl shadow-2xl p-8 overflow-x-auto min-h-[520px] bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] border border-[#e0e0e0]">
      {/* Header días */}
      <div className="grid grid-cols-8 gap-2 mb-3 sticky top-0 z-10">
        <div></div>
        {weekDays.map((d, idx) => (
          <div key={d} className="text-center font-bold text-[#0056b3] bg-white/80 py-2 rounded-xl shadow text-base tracking-wide uppercase border border-[#e0e0e0]">
            {d}
            <div className="text-xs text-gray-400 font-normal">{weekDates[idx].getDate()}</div>
          </div>
        ))}
      </div>
      {/* Grid horas x días */}
      <div className="grid grid-cols-8 gap-2">
        {/* Columna de horas */}
        <div className="flex flex-col gap-2">
          {hours.map((h) => (
            <div key={h} className="h-14 flex items-center justify-end pr-3 text-sm text-[#27ae60] font-bold bg-white/80 rounded-xl shadow border border-[#e0e0e0]">
              {h}
            </div>
          ))}
        </div>
        {/* Bloques */}
        {weekDays.map((_, dayIdx) => (
          <div key={dayIdx} className="flex flex-col gap-2">
            {hours.map((_, hourIdx) => {
              const date = weekDates[dayIdx];
              const found = classes.find(
                c => c.date.toDateString() === date.toDateString() && c.hour === hourIdx + 9 // 9 AM = 0
              );
              const status = found ? found.status : 'free';
              return (
                <button
                  key={hourIdx}
                  className={`h-14 w-full rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#27ae60] ${statusStyles[status]} ${status !== 'free' ? 'hover:scale-105 hover:shadow-2xl' : 'hover:bg-gray-200'}`}
                  onClick={() => onTimeBlockClick({ day: dayIdx, hour: hourIdx + 9, status })}
                >
                  {statusIcon[status]}
                  {statusLabel[status] && (
                    <span className="ml-1 px-2 py-1 rounded-full text-xs font-bold tracking-wide"
                      style={{
                        background: status === 'scheduled' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.18)',
                        color: 'inherit',
                      }}
                    >
                      {statusLabel[status]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid; 