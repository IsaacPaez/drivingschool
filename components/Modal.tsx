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
      <div className="relative bg-white w-full max-w-5xl sm:max-w-6xl rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
        
      

          {children}
        </div>

    </div>
  );
};

export default Modal;
