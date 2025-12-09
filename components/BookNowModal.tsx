"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";

interface BookNowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookNowModal: React.FC<BookNowModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const options = [
    {
      title: "Driving Test",
      description: "Schedule your driving test appointment",
      path: "/Book-Now",
      bgColor: "bg-[#0056b3]",
      hoverColor: "hover:bg-[#003d82]",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Driving Lessons",
      description: "Book your personalized driving lessons",
      path: "/driving-lessons",
      bgColor: "bg-[#27ae60]",
      hoverColor: "hover:bg-[#1e8449]",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      title: "Traffic School",
      description: "Enroll in traffic school classes",
      path: "/classes",
      bgColor: "bg-[#f39c12]",
      hoverColor: "hover:bg-[#d68910]",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  const handleOptionClick = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 sm:p-10 overflow-y-auto max-h-[85vh]">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
            Select a Service
          </h2>
          <p className="text-gray-600 text-base">
            Choose the service you would like to book
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option.path)}
              className={`group relative ${option.bgColor} ${option.hoverColor} 
                p-6 rounded-lg text-white shadow-md transition-all duration-300 
                hover:shadow-xl hover:-translate-y-1 active:translate-y-0
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400`}
            >
              {/* Icon */}
              <div className="mb-4 flex justify-center">
                {option.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-2 text-center">
                {option.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-white/90 text-center leading-relaxed">
                {option.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default BookNowModal;
