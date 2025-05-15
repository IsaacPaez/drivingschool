import React from 'react';

interface TimeBlock {
  id: string;
  time: string;
  status: 'scheduled' | 'cancelled' | 'free' | 'booked' | 'available' | 'unavailable';
  date?: Date;
}

interface CalendarGridProps {
  blocks: TimeBlock[];
  onBlockClick: (block: TimeBlock) => void;
}

export default function CalendarGrid({ blocks, onBlockClick }: CalendarGridProps) {
  // Generar los labels de tiempo de 30 minutos
  const startHour = 6;
  const endHour = 20;
  const timeLabels: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    timeLabels.push(`${h.toString().padStart(2, '0')}:00`);
    timeLabels.push(`${h.toString().padStart(2, '0')}:30`);
  }

  // Agrupar los bloques por día
  const days = Array.from(new Set(blocks.map(b => b.date?.toDateString ? b.date.toDateString() : '')));
  const blocksByDay: Record<string, TimeBlock[]> = {};
  days.forEach(day => {
    blocksByDay[day] = blocks.filter(b => (b.date?.toDateString ? b.date.toDateString() : '') === day);
  });

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border bg-gray-50"></th>
            {days.map((day, idx) => (
              <th key={idx} className="p-2 border bg-gray-50 text-center">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeLabels.map((label, rowIdx) => (
            <tr key={label}>
              <td className="p-2 border bg-gray-100 text-right font-bold w-20">{label}</td>
              {days.map((day, colIdx) => {
                const block = blocksByDay[day][rowIdx];
                return (
                  <td
                    key={colIdx}
                    className={`p-2 border text-center cursor-pointer ${
                      block?.status === 'booked' ? 'bg-blue-100' :
                      block?.status === 'cancelled' ? 'bg-red-100' :
                      block?.status === 'available' ? 'bg-gray-200' :
                      'bg-gray-50'
                    }`}
                    onClick={() => block && onBlockClick(block)}
                  >
                    {block?.status === 'booked' && 'Scheduled'}
                    {block?.status === 'cancelled' && 'Cancelled'}
                    {block?.status === 'available' && 'Free'}
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