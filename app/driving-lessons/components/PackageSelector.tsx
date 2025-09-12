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


interface PackageSelectorProps {
  selectedDate: Date | null;
  onDateChange: (value: CalendarValue) => void;
  products: Product[];
  selectedProduct: Product | null;
  onProductSelect: (product: Product) => void;
  onRequestSchedule: () => void;
  selectedHours: number;
}

export default function PackageSelector({
  selectedDate,
  onDateChange,
  products,
  selectedProduct,
  onProductSelect,
  onRequestSchedule,
  selectedHours
}: PackageSelectorProps) {
  return (
    <div className="w-full lg:w-1/3 flex flex-col items-center mt-8 sm:mt-12">
      
      {/* Calendar Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-[#10B981]">
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


      {/* Available Driving Packages Title */}
      <h3 className="text-lg sm:text-xl font-semibold text-center mb-4 text-black">
        Available Driving Packages
      </h3>

      {/* Packages Dropdown */}
      <div className="w-full mb-4">
        <select
          value={selectedProduct?._id || ""}
          onChange={(e) => {
            const selectedId = e.target.value;
            const product = products.find(p => p._id === selectedId);
            onProductSelect(product || null);
          }}
          className="w-full p-4 border-2 border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white text-black font-medium"
        >
          <option value="" className="text-black text-lg">Select a driving package...</option>
          {products.map((product) => (
            <option key={product._id} value={product._id} className="text-black text-lg">
              {product.title} - ${product.price} ({product.duration || 0} hrs)
            </option>
          ))}
        </select>
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
