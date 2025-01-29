"use client";

import React from "react";

interface ClassListProps {
  selectedClass: string;
  setSelectedClass: (className: string) => void;
}

const ClassList: React.FC<ClassListProps> = ({
  selectedClass,
  setSelectedClass,
}) => {
  const classes = [
    { name: "4hr Traffic Law & Substance Abuse Class", key: "trafficLaw" },
    { name: "4 hr (BDI) Basic Driving Improvement Class", key: "bdiClass" },
    { name: "8hr Court Ordered IDI Intermediate Class", key: "idiClass" },
    { name: "12hr (ADI) Advanced Driving Improvement", key: "adiClass" },
    { name: "8 hr Aggressive Driving Improvement", key: "aggressiveClass" },
    { name: "3 Crashes in 3 Years", key: "crashClass" },
    { name: "Senior Insurance Discount", key: "seniorDiscount" },
    { name: "12hr ADI Multi-Day Improvement", key: "multiDayClass" },
  ];

  return (
    <div className="w-full md:w-[290px] bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold text-center mb-4 text-gray-900">
        Class List
      </h3>
      <ul className="space-y-3">
        {classes.map(({ name, key }) => (
          <li
            key={key}
            className={`p-3 rounded-lg cursor-pointer transition text-center font-medium text-gray-900 shadow-md
              ${
                selectedClass === key
                  ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            onClick={() => setSelectedClass(key)}
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClassList;
