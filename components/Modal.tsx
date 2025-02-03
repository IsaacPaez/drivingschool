import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-lg p-6 md:p-10 overflow-y-auto max-h-[90vh]">
        {/* Botón de Cerrar */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl"
          onClick={onClose}
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
};

export default Modal;
