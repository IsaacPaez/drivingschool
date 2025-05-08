import React from 'react';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = [6,7,8,9,10,11,12,13,14,15,16,17,18];

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
  free: 'bg-gray-400 text-white border border-gray-200',
  scheduled: 'bg-[#0056b3] text-white border border-0 shadow-lg',
  canceled: 'bg-[#f44336] text-white border-0 shadow-lg',
  cancelled: 'bg-[#f44336] text-white border-0 shadow-lg',
};

const statusLabel: Record<string, string> = {
  free: 'Free',
  scheduled: 'Scheduled',
  canceled: 'Canceled',
  cancelled: 'Canceled',
};

const statusIcon: Record<string, React.ReactNode> = {
  free: <HiOutlineClock className="w-4 h-4 text-white" />,
  scheduled: <HiOutlineCheckCircle className="w-4 h-4 text-white" />,
  cancelled: <HiOutlineXCircle className="w-4 h-4 text-white" />,
};

interface Props {
  view: 'week' | 'month';
  onTimeBlockClick: (block: { day: number; hour?: number; status: string }) => void;
  selectedDate: Date;
  classes: Array<{
    date: Date;
    hour: number;
    status: string;
    slotId?: string;
  }>;
}

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

// Asegura que cualquier valor sea un objeto Date
const safeDate = (d: any) => d instanceof Date ? d : new Date(`${d}T00:00:00`);

const getBlockStatus = (hour: number, day: number, selectedDate: Date, classes: Props['classes']) => {
  const date = new Date(selectedDate);
  date.setHours(0,0,0,0); // normaliza a medianoche
  date.setDate(selectedDate.getDate() + day);
  const found = classes.find(c =>
    safeDate(c.date).toDateString() === date.toDateString() &&
    c.hour === hour
  );
  return found ? found.status : 'free';
};

const hourRanges = [
  '6:00-7:00', '7:00-8:00', '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00',
  '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00'
];

const statusClass: { [key: string]: string } = {
  scheduled: 'bg-[#0056b3] text-white',
  canceled: 'bg-red-500 text-white',
  cancelled: 'bg-red-500 text-white',
  free: 'bg-gray-300 text-gray-700',
  empty: 'bg-white text-gray-400',
};

const CalendarGrid: React.FC<Props> = ({ view, onTimeBlockClick, selectedDate, classes }) => {
  console.log('Classes recibidas en CalendarGrid:', classes);
  if (view === 'month') {
    const today = selectedDate;
    const matrix = getMonthMatrix(today.getFullYear(), today.getMonth());
    const daysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const getStatusTypes = (day: number | null) => {
      if (!day) return [];
      const statuses = classes
        .filter(c => safeDate(c.date).getDate() === day && safeDate(c.date).getMonth() === today.getMonth() && safeDate(c.date).getFullYear() === today.getFullYear())
        .map(c => (c.status === 'canceled' ? 'cancelled' : c.status));
      // Únicos y en orden: scheduled, cancelled, free
      return ['scheduled', 'cancelled', 'free'].filter(s => statuses.includes(s));
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
                const statusTypes = getStatusTypes(day);
                return (
                  <button
                    key={j}
                    className={`h-20 w-full rounded-xl font-semibold text-base flex flex-col items-center justify-center gap-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#27ae60] ${statusTypes.length === 1 ? statusStyles[statusTypes[0]] : 'bg-white border border-gray-200'}`}
                    disabled={!day}
                    onClick={() => day && onTimeBlockClick({ day, status: statusTypes[0] || 'free' })}
                  >
                    <span className="text-lg font-bold">{day || ''}</span>
                    <div className="flex flex-col w-full mt-1 gap-0.5">
                      {statusTypes.length > 0 && statusTypes.map((status, idx) => (
                        <span key={status} className={`flex items-center justify-center w-full rounded h-4 text-xs font-bold ${statusStyles[status]}`}
                          style={{ minHeight: 16 }}>
                          {statusIcon[status]}
                        </span>
                      ))}
                    </div>
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
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(selectedDate.getDate() - ((startOfWeek.getDay() + 6) % 7));
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
  const todayIdx = weekDates.findIndex(d => d.toDateString() === new Date().toDateString());

  return (
    <div className="rounded-3xl shadow-2xl p-4 overflow-x-auto min-h-[520px] bg-gradient-to-br from-[#e8f6ef] via-[#f0f6ff] to-[#eafaf1] border border-[#e0e0e0]">
      {/* Header días */}
      <div className="grid grid-cols-8 gap-0 mb-2 sticky top-0 z-10">
        <div></div>
        {weekDays.map((d, idx) => (
          <div
            key={d}
            className={`text-center font-bold text-[#0056b3] bg-white/80 py-2 rounded-t-xl shadow text-base tracking-wide uppercase border border-[#e0e0e0] border-b-2 ${todayIdx === idx ? 'bg-green-100 border-green-400' : ''}`}
          >
            {d}
            <div className="text-xs text-gray-400 font-normal">{weekDates[idx].getDate()}</div>
          </div>
        ))}
      </div>
      {/* Grid horas x días */}
      <div className="grid grid-cols-8 gap-0">
        {/* Columna de horas */}
        <div className="flex flex-col gap-0">
          {hourRanges.map((range, idx) => (
            <div key={range} className="h-8 flex items-center justify-end pr-2 text-xs text-[#27ae60] font-bold bg-white/80 border-b border-r border-[#e0e0e0]">
              {range}
            </div>
          ))}
        </div>
        {/* Bloques */}
        {weekDays.map((_, dayIdx) => (
          <div key={dayIdx} className="flex flex-col gap-0">
            {hours.map((_, hourIdx) => {
              const date = weekDates[dayIdx];
              const found = classes.find(c =>
                safeDate(c.date).toDateString() === date.toDateString() &&
                c.hour === hourIdx + 6
              );
              if (!found) {
                return (
                  <div key={hourIdx} className="h-8 w-full border-b border-r border-[#e0e0e0] bg-white"></div>
                );
              }
              const status = found.status === 'canceled' ? 'cancelled' : found.status;
              return (
                <button
                  key={hourIdx}
                  className={`h-8 w-full rounded-none font-semibold text-xs flex items-center justify-center gap-1 border-b border-r border-[#e0e0e0] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#27ae60] ${status === 'scheduled' ? 'bg-[#0056b3] text-white' : statusClass[status] || statusClass.free}`}
                  onClick={() => onTimeBlockClick({ day: dayIdx, hour: hourIdx + 6, status })}
                  title={status === 'scheduled' ? `Class scheduled\n${hours[hourIdx]}` : ''}
                >
                  {status === 'scheduled' ? (
                    <span className="flex items-center gap-1 w-full text-center font-bold justify-center">
                      {statusIcon['scheduled']}<span>Scheduled</span>
                    </span>
                  ) : status === 'cancelled' ? (
                    <span className="flex items-center gap-1 w-full text-center font-bold justify-center">
                      {statusIcon['cancelled']}<span>Cancelled</span>
                    </span>
                  ) : status === 'free' ? (
                    <span className="flex items-center gap-1 w-full text-center font-bold justify-center">
                      {statusIcon['free']}<span>Free</span>
                    </span>
                  ) : null}
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