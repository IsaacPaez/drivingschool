"use client";

import React from 'react';

interface ClassTypeSelectorProps {
  selectedClassType: string;
  onClassTypeChange: (type: string) => void;
}

const ClassTypeSelector: React.FC<ClassTypeSelectorProps> = ({
  selectedClassType,
  onClassTypeChange
}) => {
  const classTypes = ["ADI", "BDI", "DATE"];

  return (
    <div className="mb-4 w-full">
      <h3 className="text-lg font-semibold text-center mb-3 text-blue-600">Select Class Type</h3>
      <div className="grid grid-cols-3 gap-2">
        {classTypes.map((type) => (
          <button
            key={type}
            onClick={() => onClassTypeChange(type)}
            className={`py-2 px-4 rounded-lg font-medium transition-all ${
              selectedClassType === type 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClassTypeSelector;
