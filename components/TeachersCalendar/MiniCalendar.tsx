import React from 'react';
import Calendar from 'react-calendar';
import type { Value } from 'react-calendar/dist/cjs/shared/types';
import 'react-calendar/dist/Calendar.css';

const MiniCalendar: React.FC<{ 
  value: Date; 
  onChange: (date: Date) => void 
}> = ({ value, onChange }) => {
  const handleChange = (value: Value) => {
    if (value instanceof Date) {
      onChange(value);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Calendar
        locale="en-US"
        className="!border-0 !bg-transparent !text-black !w-full !max-w-xs"
        tileClassName={({ view }) =>
          view === 'month' ? '!rounded-lg !text-black hover:!bg-[#e3f6fc]' : ''
        }
        prev2Label={null}
        next2Label={null}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default MiniCalendar; 