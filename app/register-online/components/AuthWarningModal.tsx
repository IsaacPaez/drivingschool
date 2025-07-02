"use client";

import Modal from "@/components/Modal";

interface AuthWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthWarningModal({ isOpen, onClose }: AuthWarningModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-4 text-red-600">Authentication Required</h2>
        <p className="mb-4">You must be logged in to register for a class. Please sign in first.</p>
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}
