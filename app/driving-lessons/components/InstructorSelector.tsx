"use client";

import React, { useState } from "react";
import Image from "next/image";

interface Instructor {
  _id: string;
  name: string;
  photo?: string;
  email?: string;
  schedule_driving_lesson?: any[];
}

interface InstructorSelectorProps {
  instructors: Instructor[];
  selectedInstructor: Instructor | null;
  onInstructorSelect: (instructor: Instructor | null) => void;
}

export default function InstructorSelector({
  instructors,
  selectedInstructor,
  onInstructorSelect
}: InstructorSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxVisible = 3;

  const visibleInstructors = instructors.slice(currentIndex, currentIndex + maxVisible);
  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex + maxVisible < instructors.length;

  const goLeft = () => {
    if (canGoLeft) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goRight = () => {
    if (canGoRight) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="mb-4">
      <h3 className="text-lg font-bold text-center mb-3 text-black">Select Instructor</h3>
      
      <div className="relative">
        {/* Left Arrow */}
        {canGoLeft && (
          <button
            onClick={goLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-1 shadow-sm hover:bg-gray-50"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right Arrow */}
        {canGoRight && (
          <button
            onClick={goRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-1 shadow-sm hover:bg-gray-50"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Instructor Cards */}
        <div className="flex justify-center gap-2 px-8">
          {visibleInstructors.map((instructor) => {
            const availableCount = instructor.schedule_driving_lesson?.filter(
              lesson => lesson.status === "available"
            ).length || 0;
            const isSelected = selectedInstructor?._id === instructor._id;

            return (
              <div
                key={instructor._id}
                className={`border rounded-lg p-2 text-center bg-white shadow-sm cursor-pointer transition-all hover:shadow-md min-w-[70px] ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                onClick={() => onInstructorSelect(isSelected ? null : instructor)}
              >
                <Image
                  src={instructor.photo || '/default-instructor.png'}
                  alt={instructor.name}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full mx-auto mb-1 object-cover"
                />
                <h4 className="font-semibold text-xs text-black truncate mb-1">{instructor.name}</h4>
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {availableCount} available
                </span>
                {isSelected && (
                  <div className="mt-1">
                    <span className="inline-block bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                      ✓
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Show count when many instructors */}
      {instructors.length > 3 && (
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {currentIndex + 1}-{Math.min(currentIndex + maxVisible, instructors.length)} of {instructors.length} instructors
          </span>
        </div>
      )}
    </div>
  );
}
