"use client";

import React from "react";
import Calendar from "react-calendar";
import Image from "next/image";
import "react-calendar/dist/Calendar.css";

type CalendarValue = Date | null | (Date | null)[];

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  buttonLabel: string;
  category: string;
  duration?: number;
  media?: string[];
}

interface Instructor {
  _id: string;
  name: string;
  photo?: string;
  email?: string;
  schedule_driving_lesson?: any[];
}

interface PackageSelectorProps {
  selectedDate: Date | null;
  onDateChange: (value: CalendarValue) => void;
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
  onRequestSchedule: () => void;
  selectedHours: number;
  instructors: Instructor[];
  selectedInstructorForSchedule: Instructor | null;
  onInstructorSelect: (instructor: Instructor | null) => void;
  getScheduleForInstructor: (instructorId: string) => any[];
}

export default function PackageSelector({
  selectedDate,
  onDateChange,
  products,
  selectedProduct,
  onProductSelect,
  onRequestSchedule,
  selectedHours,
  instructors,
  selectedInstructorForSchedule,
  onInstructorSelect,
  getScheduleForInstructor
}: PackageSelectorProps) {
  return (
    <div className="w-full lg:w-1/3 flex flex-col items-center mt-8 sm:mt-12">
      
      {/* Calendar Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-gray-800">
        Select Date
      </h2>
      
      {/* Calendar */}
      <div className="mb-4 w-full flex justify-center">
        <Calendar
          onChange={onDateChange}
          value={selectedDate}
          locale="en-US"
          className="border rounded-lg shadow-md w-full max-w-xs p-2"
          minDate={new Date()}
        />
      </div>

      {/* Available Instructors - Horizontal Scroll with Max 3 per Row */}
      <div className="mb-6 w-full">
        <h3 className="text-lg font-bold text-center mb-3 text-black">Select Instructor</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {instructors.map((instructor) => {
            // Use SSE data first, fallback to static data
            const sseSchedule = getScheduleForInstructor(instructor._id);
            const scheduleToUse = sseSchedule && sseSchedule.length > 0 ? sseSchedule : instructor.schedule_driving_lesson;
            
            const availableCount = scheduleToUse?.filter(
              lesson => lesson.status === "available"
            ).length || 0;
            const isSelected = selectedInstructorForSchedule?._id === instructor._id;

            return (
              <div
                key={instructor._id}
                className={`border rounded-lg p-2 text-center bg-white shadow-sm cursor-pointer transition-all hover:shadow-md flex-shrink-0 w-[80px] ${
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
        
        {/* Show count when many instructors */}
        {instructors.length > 3 && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {instructors.length} instructors available
            </span>
          </div>
        )}
      </div>

      {/* Available Driving Packages Title */}
      <h3 className="text-lg sm:text-xl font-semibold text-center mb-4 text-gray-700">
        Available Driving Packages
      </h3>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 w-full">
        {products.map((product) => (
          <div
            key={product._id}
            className={`shadow-lg rounded-xl p-3 sm:p-4 text-center cursor-pointer hover:shadow-xl transition-all w-full ${
              selectedProduct?._id === product._id 
                ? "border-4 border-blue-500 bg-blue-100" 
                : "bg-white"
            }`}
            onClick={() => onProductSelect(product)}
          >
            <div className="flex flex-col items-center">
              <span className="text-sm sm:text-md font-semibold text-black text-center leading-tight">
                {product.title}
              </span>
              <div className="flex justify-between items-center mt-2 w-full">
                <span className="text-lg font-bold text-green-600">${product.price}</span>
                {product.duration && (
                  <span className="text-sm text-blue-600 font-semibold">{product.duration} hrs</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Package Info */}
      {selectedProduct && (
        <div className="bg-blue-50 p-4 rounded-lg mt-6 w-full">
          <h3 className="font-bold text-blue-800 mb-2">Selected Package:</h3>
          <p className="text-blue-700"><strong>Package:</strong> {selectedProduct.title}</p>
          <p className="text-blue-700"><strong>Price:</strong> ${selectedProduct.price}</p>
          {selectedProduct.duration && (
            <p className="text-blue-700"><strong>Duration:</strong> {selectedProduct.duration} hours</p>
          )}
          <p className="text-blue-700"><strong>Description:</strong> {selectedProduct.description}</p>
          
          {/* Hours Selection Status */}
          <div className="mt-3 p-3 bg-white rounded border">
            <p className="text-gray-700 font-medium">
              <strong>Hours selected:</strong> {selectedHours} of {selectedProduct.duration || 0} available
            </p>
            {selectedHours > 0 && selectedHours < (selectedProduct.duration || 0) && (
              <p className="text-orange-600 text-sm mt-1">
                Please select {(selectedProduct.duration || 0) - selectedHours} more hours to continue
              </p>
            )}
            {selectedHours === (selectedProduct.duration || 0) && selectedHours > 0 && (
              <p className="text-green-600 text-sm mt-1">
                ✓ Perfect! You have selected all required hours.
              </p>
            )}
            {selectedHours > (selectedProduct.duration || 0) && (
              <p className="text-red-600 text-sm mt-1">
                You have selected too many hours. Please deselect {selectedHours - (selectedProduct.duration || 0)} hours.
              </p>
            )}
          </div>
          
          {/* Request Schedule Button */}
          <div className="mt-4">
            {selectedHours === (selectedProduct.duration || 0) && selectedHours > 0 ? (
              <button
                onClick={onRequestSchedule}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
              >
                Request Schedule ({selectedHours} hours selected)
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-400 text-white px-4 py-3 rounded-lg font-semibold cursor-not-allowed"
              >
                {selectedHours === 0 
                  ? "Select hours from schedule to continue" 
                  : `Select ${selectedProduct.duration || 0} hours to continue`
                }
              </button>
            )}
            <p className="text-sm text-blue-600 mt-2 text-center">
              Click to request a custom schedule for this package
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
