"use client";

import React from "react";
import Modal from "@/components/Modal";

interface TicketClassBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTicketClass: {
    _id: string;
    date: string;
    hour: string;
    endHour: string;
    classInfo?: {
      _id: string;
      title: string;
    };
    instructorInfo?: {
      _id: string;
      name: string;
    };
  } | null;
  classPrice: number | null;
  paymentMethod: 'online' | 'instructor';
  setPaymentMethod: (method: 'online' | 'instructor') => void;
  isOnlinePaymentLoading: boolean;
  isProcessingBooking: boolean;
  onConfirm: () => void;
}

export default function TicketClassBookingModal({
  isOpen,
  onClose,
  selectedTicketClass,
  classPrice,
  paymentMethod,
  setPaymentMethod,
  isOnlinePaymentLoading,
  isProcessingBooking,
  onConfirm
}: TicketClassBookingModalProps) {
  if (!selectedTicketClass) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-black">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Book Class</h2>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="mb-2">
                <strong>Class:</strong> {selectedTicketClass.classInfo?.title || 'Unknown Class'}
              </p>
              <p className="mb-2">
                <strong>Instructor:</strong> {selectedTicketClass.instructorInfo?.name || 'TBD'}
              </p>
              <p className="mb-2">
                <strong>Date:</strong> {selectedTicketClass.date}
              </p>
              <p className="mb-2">
                <strong>Time:</strong> {selectedTicketClass.hour} - {selectedTicketClass.endHour}
              </p>
              <p className="mb-2">
                <strong>Price:</strong> <span className="text-green-600 font-bold">${classPrice || 'TBD'}</span>
              </p>
            </div>
            
            <div>
              <p className="mb-2">
                <strong>Duration:</strong> {selectedTicketClass.endHour && selectedTicketClass.hour ? 
                  `${Math.abs(new Date(`2000-01-01T${selectedTicketClass.endHour}`).getTime() - new Date(`2000-01-01T${selectedTicketClass.hour}`).getTime()) / (1000 * 60 * 60)} hours` : 
                  'TBD'
                }
              </p>
              <p className="text-sm text-blue-600">
                <strong>Class Type:</strong> Ticket Class
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Select Payment Method</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'instructor')}
                className="mr-2"
              />
              <span className="text-green-600 font-medium">💳 Online Payment</span>
              <span className="text-sm text-gray-500 ml-2">(Pay now with credit card)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="paymentMethod"
                value="instructor"
                checked={paymentMethod === 'instructor'}
                onChange={(e) => setPaymentMethod(e.target.value as 'online' | 'instructor')}
                className="mr-2"
              />
              <span className="text-blue-600 font-medium">🏪 Pay at Location</span>
              <span className="text-sm text-gray-500 ml-2">(Pay when you arrive)</span>
            </label>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-3">
          <button
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            onClick={onClose}
            disabled={isOnlinePaymentLoading || isProcessingBooking}
          >
            Cancel
          </button>
          
          <button
            className={`px-6 py-2 rounded font-medium transition-all ${
              paymentMethod === 'online'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            onClick={onConfirm}
            disabled={isOnlinePaymentLoading || isProcessingBooking}
          >
            {isOnlinePaymentLoading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : isProcessingBooking ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : paymentMethod === 'online' ? (
              '💳 Pay Online'
            ) : (
              '🏪 Reserve & Pay Later'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
