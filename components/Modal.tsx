"use client";

import React from "react";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white p-10 rounded-lg shadow-2xl max-w-7xl w-full relative overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-5 right-5 text-gray-600 hover:text-gray-900 text-2xl font-bold"
          onClick={onClose}
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
