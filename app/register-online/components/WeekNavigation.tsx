"use client";

import React from 'react';

interface WeekNavigationProps {
  weekOffset: number;
  onWeekChange: (offset: number) => void;
}

const WeekNavigation: React.FC<WeekNavigationProps> = ({
  weekOffset,
  onWeekChange
}) => {
  return (
    <div className="flex flex-row justify-center items-center mb-8 gap-2 sm:gap-4">
      <button
        className="px-3 py-1.5 text-xs sm:text-sm bg-green-500 text-white rounded-full hover:bg-green-600 font-semibold shadow transition-all duration-200"
        onClick={() => onWeekChange(weekOffset - 1)}
      >
        ← Previous week
      </button>
      <button
        className="px-3 py-1.5 text-xs sm:text-sm bg-green-500 text-white rounded-full hover:bg-green-600 font-semibold shadow transition-all duration-200"
        onClick={() => onWeekChange(weekOffset + 1)}
      >
        Next week →
      </button>
    </div>
  );
};

export default WeekNavigation;
