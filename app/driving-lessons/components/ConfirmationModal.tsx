"use client";

import React from "react";
import Modal from "@/components/Modal";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  message
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        <h2 className="text-lg font-semibold text-blue-600 mb-2">Processing...</h2>
        <p className="text-gray-700">{message}</p>
      </div>
    </Modal>
  );
}
