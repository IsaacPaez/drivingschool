"use client";

import React from 'react';
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface DateSelectorProps {
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange
}) => {
  const handleDateChange = (value: any) => {
    if (!value || Array.isArray(value)) {
      onDateChange(null);
      return;
    }
    onDateChange(value as Date);
  };

  return (
    <div className="mb-4 w-full flex justify-center">
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        locale="en-US"
        className="border rounded-lg shadow-md w-full max-w-xs p-2"
      />
    </div>
  );
};

export default DateSelector;
