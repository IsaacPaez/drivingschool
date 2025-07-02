"use client";

import React from 'react';
import Image from "next/image";

interface Instructor {
  _id: string;
  name: string;
  photo?: string;
}

interface InstructorSelectorProps {
  instructors: Instructor[];
  selectedInstructor: Instructor | null;
  onInstructorSelect: (instructor: Instructor) => void;
}

const InstructorSelector: React.FC<InstructorSelectorProps> = ({
  instructors,
  selectedInstructor,
  onInstructorSelect
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2 w-full">
      {instructors.map((inst) => {
        const [firstName, ...lastNameParts] = inst.name.split(' ');
        const lastName = lastNameParts.join(' ');
        return (
          <div
            key={inst._id}
            className={`shadow-lg rounded-xl p-2 sm:p-4 text-center cursor-pointer hover:shadow-xl transition-all w-full ${
              selectedInstructor?._id === inst._id 
                ? "border-4 border-green-500 bg-green-100" 
                : "bg-white"
            }`}
            onClick={() => onInstructorSelect(inst)}
          >
            <Image
              src={inst.photo || "/default-avatar.png"}
              alt={inst.name}
              width={60}
              height={60}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-full mx-auto mb-1 sm:mb-2"
            />
            <div className="flex flex-col items-center mt-1 sm:mt-2">
              <span className="text-sm sm:text-md font-semibold text-black leading-tight">
                {firstName}
              </span>
              <span className="text-xs sm:text-sm text-gray-600 leading-tight">
                {lastName}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InstructorSelector;
