"use client";

import React from "react";
import Modal from "@/components/Modal";

interface AuthWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function AuthWarningModal({
  isOpen,
  onClose,
  onLogin
}: AuthWarningModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4 text-red-600">Login Required</h2>
        <p className="text-gray-700 mb-4">
          Please log in to book a driving lesson package.
        </p>
        <div className="flex justify-center gap-3">
          <button
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
            onClick={onLogin}
          >
            Login
          </button>
        </div>
      </div>
    </Modal>
  );
}
