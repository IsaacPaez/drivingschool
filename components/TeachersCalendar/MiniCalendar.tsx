import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './MiniCalendarCustom.css';

const MiniCalendar: React.FC<{ 
  value: Date; 
  onChange: (date: Date) => void 
}> = ({ value, onChange }) => {
  const handleChange = (value: Date) => {
    if (value instanceof Date) {
      onChange(value);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Calendar
        locale="en-US"
        className="mini-calendar-custom !border-0 !bg-gradient-to-br !from-[#e3f6fc] !to-[#eafaf1] !rounded-2xl !shadow-xl !p-2 !w-full !max-w-xs transition-all duration-300"
        tileClassName={({ date, view }) => {
          let classes = '!rounded-xl !text-black !font-semibold transition-all duration-200';
          if (view === 'month') {
            if (value && date.toDateString() === new Date().toDateString()) {
              classes += ' !bg-[#27ae60]/80 !text-white scale-105 shadow-lg'; // Hoy
            }
            if (value && date.toDateString() === value.toDateString()) {
              classes += ' !bg-[#0056b3] !text-white scale-110 shadow-2xl border-2 border-[#27ae60]'; // Seleccionado
            }
            classes += ' hover:!bg-[#e3f6fc] hover:scale-105';
          }
          return classes;
        }}
        prev2Label={null}
        next2Label={null}
        prevLabel={<span className="text-[#0056b3] text-xl font-bold">‹</span>}
        nextLabel={<span className="text-[#0056b3] text-xl font-bold">›</span>}
        formatMonthYear={(locale, date) =>
          date.toLocaleString(locale, { month: 'long', year: 'numeric' })
        }
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default MiniCalendar; 