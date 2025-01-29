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
    <div className="w-[300px] bg-gray-100 p-4 rounded-xl shadow-md">
      <h3 className="text-xl font-semibold text-center mb-4">Class List</h3>
      <ul className="space-y-3">
        {classes.map(({ name, key }) => (
          <li
            key={key}
            className={`p-3 rounded-lg cursor-pointer transition text-center 
              ${
                selectedClass === key
                  ? "bg-[#27ae60] text-white font-semibold"
                  : "bg-green-200 text-black hover:bg-gray-200"
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
