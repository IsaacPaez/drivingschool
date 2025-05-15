import React from 'react';
import { HiOutlineClock, HiCheck } from 'react-icons/hi';

interface TimeBlock {
  id: string;
  time: string;
  status: 'scheduled' | 'cancelled' | 'free' | 'booked' | 'available' | 'unavailable';
  date?: Date;
}

interface CalendarGridProps {
  blocks: TimeBlock[];
  onBlockClick: (block: TimeBlock) => void;
  selectedDate?: Date;
}

export default function CalendarGrid({ blocks, onBlockClick, selectedDate }: CalendarGridProps) {
  // Generar los labels de tiempo de 30 minutos con ambos extremos
  const startHour = 6;
  const endHour = 20;
  const timeLabels: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    timeLabels.push(`${h.toString().padStart(2, '0')}:00-${h.toString().padStart(2, '0')}:30`);
    timeLabels.push(`${h.toString().padStart(2, '0')}:30-${(h+1).toString().padStart(2, '0')}:00`);
  }

  // Calcular los días de la semana actual (lunes a domingo)
  const startOfWeek = selectedDate ? new Date(selectedDate) : new Date();
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7)); // Lunes
  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const today = new Date();
  today.setHours(0,0,0,0);

  // Agrupar los bloques por día y hora
  const blocksByDayHour: Record<string, Record<string, TimeBlock>> = {};
  blocks.forEach(b => {
    if (!b.date) return;
    const dayKey = `${b.date.getFullYear()}-${(b.date.getMonth()+1).toString().padStart(2, '0')}-${b.date.getDate().toString().padStart(2, '0')}`;
    if (!blocksByDayHour[dayKey]) blocksByDayHour[dayKey] = {};
    blocksByDayHour[dayKey][b.time] = b;
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse rounded-2xl" style={{ border: '2px solid #27ae60', borderRadius: '18px', overflow: 'hidden', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th className="p-2 bg-white text-center font-bold w-32 sticky left-0 z-10" style={{ color: '#27ae60', border: '1px solid #e0e0e0', fontSize: '1rem', background: '#f8fafd', minWidth: 110, maxWidth: 110 }}>Time</th>
            {weekDays.map((d, i) => (
              <th key={i} className="p-2 text-center font-bold" style={{ color: '#0056b3', border: '1px solid #e0e0e0', fontSize: '1rem', minWidth: 110, maxWidth: 110, background: '#f8fafd' }}>
                <div className="flex flex-col items-center justify-center">
                  <span className="uppercase tracking-wide" style={{ fontSize: '0.95rem' }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="font-extrabold text-lg" style={{ letterSpacing: 1 }}>{d.getDate()}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeLabels.map((label, rowIdx) => (
            <tr key={label}>
              <td className="p-2 border text-center font-bold w-32 sticky left-0 z-10" style={{ color: '#27ae60', border: '1px solid #e0e0e0', background: '#fff', minWidth: 110, maxWidth: 110 }}>{label}</td>
              {weekDays.map((d, colIdx) => {
                const dayKey = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
                const block = blocksByDayHour[dayKey]?.[label];
                if (block?.status === 'booked' || block?.status === 'scheduled') {
                  return (
                    <td
                      key={colIdx}
                      className="p-0 border text-center align-middle"
                      style={{ background: '#0056b3', border: '1px solid #e0e0e0', borderRadius: 0, cursor: 'pointer', height: '22px', minHeight: '22px', minWidth: 110, maxWidth: 110 }}
                      onClick={() => block && onBlockClick(block)}
                    >
                      <div className="flex items-center justify-center w-full font-bold gap-1" style={{ borderRadius: 0, height: '22px', fontSize: '0.95rem', color: '#fff' }}>
                        <HiCheck className="text-white" size={15} /> Scheduled
                      </div>
                    </td>
                  );
                }
                if (block?.status === 'cancelled') {
                  return (
                    <td
                      key={colIdx}
                      className="p-0 border text-center align-middle"
                      style={{ background: '#f44336', border: '1px solid #e0e0e0', borderRadius: 0, height: '22px', minHeight: '22px', minWidth: 110, maxWidth: 110 }}
                    >
                      <div className="flex items-center justify-center w-full font-bold gap-1" style={{ borderRadius: 0, height: '22px', fontSize: '0.95rem', color: '#fff' }}>
                        <span style={{fontSize: '1em', marginRight: 4, color: '#fff', filter: 'brightness(1000%)'}}>❌</span> Cancelled
                      </div>
                    </td>
                  );
                }
                if (block?.status === 'free' || block?.status === 'available') {
                  return (
                    <td
                      key={colIdx}
                      className="p-0 border text-center align-middle"
                      style={{ background: '#b0b0b0', border: '1px solid #e0e0e0', borderRadius: 0, height: '22px', minHeight: '22px', minWidth: 110, maxWidth: 110 }}
                    >
                      <div className="flex items-center justify-center w-full font-bold gap-1" style={{ borderRadius: 0, height: '22px', fontSize: '0.95rem', color: '#fff' }}>
                        <HiOutlineClock className="text-white" size={13} /> Free
                      </div>
                    </td>
                  );
                }
                // Celda vacía o sin slot: ícono de reloj gris claro
                return (
                  <td key={colIdx} className="p-0 border text-center align-middle bg-white" style={{ border: '1px solid #e0e0e0', height: '22px', minHeight: '22px', minWidth: 110, maxWidth: 110 }}>
                    <div className="flex items-center justify-center w-full" style={{ height: '22px' }}>
                      <HiOutlineClock className="text-gray-300" size={16} />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 