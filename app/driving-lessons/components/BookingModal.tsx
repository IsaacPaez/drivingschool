"use client";

import React from "react";
import Modal from "@/components/Modal";

interface Instructor {
  _id: string;
  name: string;
  photo?: string;
  email?: string;
}

interface ScheduleEntry {
  date: string;
  start: string;
  end: string;
  status: string;
  classType?: string;
  pickupLocation?: string;
  dropOffLocation?: string;
  selectedProduct?: string;
  studentId?: string;
  studentName?: string;
  paid?: boolean;
}

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

interface SelectedTimeSlot {
  date: string;
  start: string;
  end: string;
  instructors: Instructor[];
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: Product | null;
  selectedSlot: ScheduleEntry | null;
  selectedTimeSlot: SelectedTimeSlot | null;
  selectedInstructor: Instructor | null;
  onInstructorSelect: (instructor: Instructor | null) => void;
  onBookPackage: () => void;
}

export default function BookingModal({
  isOpen,
  onClose,
  selectedProduct,
  selectedSlot,
  selectedTimeSlot,
  selectedInstructor,
  onInstructorSelect,
  onBookPackage
}: BookingModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-black">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Confirm Booking</h2>
        {selectedProduct && selectedSlot && selectedTimeSlot && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="mb-2"><strong>Package:</strong> {selectedProduct.title}</p>
            <p className="mb-2"><strong>Price:</strong> ${selectedProduct.price}</p>
            {selectedProduct.duration && (
              <p className="mb-2"><strong>Duration:</strong> {selectedProduct.duration} hours</p>
            )}
            
            {/* Instructor selector if multiple available */}
            {selectedTimeSlot.instructors.length > 1 ? (
              <div className="mb-2">
                <label className="block font-semibold mb-1">Select Instructor:</label>
                <select
                  className="border rounded px-2 py-1 w-full"
                  value={selectedInstructor?._id || ''}
                  onChange={e => {
                    const id = e.target.value;
                    const found = selectedTimeSlot.instructors.find(i => i._id === id);
                    onInstructorSelect(found || null);
                  }}
                >
                  <option value="">Choose an instructor...</option>
                  {selectedTimeSlot.instructors.map((inst) => (
                    <option key={inst._id} value={inst._id}>{inst.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="mb-2"><strong>Instructor:</strong> {selectedTimeSlot.instructors[0]?.name}</p>
            )}
            
            <p className="mb-2"><strong>Date:</strong> {selectedTimeSlot.date}</p>
            <p className="mb-2"><strong>Time:</strong> {selectedTimeSlot.start} - {selectedTimeSlot.end}</p>
            <p className="mb-2"><strong>Description:</strong> {selectedProduct.description}</p>
          </div>
        )}
        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Next:</strong> You will be redirected to Calendly to schedule your lessons.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <button
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
            onClick={onBookPackage}
            disabled={!!(selectedTimeSlot && selectedTimeSlot.instructors.length > 1 && !selectedInstructor)}
          >
            Continue to Calendly
          </button>
        </div>
      </div>
    </Modal>
  );
}
