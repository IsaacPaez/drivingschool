"use client";

import React from "react";
import { FaCircle } from "react-icons/fa6"; // Ícono sutil para la selección

interface ClassListProps {
  selectedClass: number;
  setSelectedClass: (index: number) => void;
}

const ClassList: React.FC<ClassListProps> = ({ selectedClass, setSelectedClass }) => {
  const classes = [
    "4hr Traffic Law & Substance Abuse Class",
    "4 hr (BDI) Basic Driving Improvement Class",
    "8hr Court Ordered IDI Intermediate Class",
    "12hr (ADI) Advanced Driving Improvement",
    "8 hr Aggressive Driving Improvement",
    "3 Crashes in 3 Years",
    "Senior Insurance Discount",
    "12hr ADI Multi-Day Improvement"
  ];

  return (
    <ul className="space-y-2 bg-[#f8f9fa] p-4 rounded-lg shadow-md border border-gray-200">
      {classes.map((className, index) => (
        <li
          key={index}
          className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-all duration-300
            ${
              selectedClass === index
                ? "bg-[#e8f5e9] text-[#27ae60] font-semibold" // Clase seleccionada
                : "bg-white hover:bg-gray-100 text-black"
            }`}
          onClick={() => setSelectedClass(index)}
        >
          {className}
          {selectedClass === index && <FaCircle className="text-[#27ae60] text-xs" />} {/* Ícono sutil para selección */}
        </li>
      ))}
    </ul>
  );
};

export default ClassList;
