"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthContext";
import { FaSignOutAlt, FaUser } from "react-icons/fa";

interface UserDropdownProps {
  onClose: () => void;
}

export default function UserDropdown({ onClose }: UserDropdownProps) {
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleLogout = () => {
    logout();
    onClose();
    // No redirigir - el usuario se queda en la misma página
  };

  // Solo mostrar para usuarios regulares (no instructores)
  if (!user || user.type === "instructor") {
    return (
      <div 
        ref={dropdownRef}
        className="absolute top-14 right-0 bg-white border-2 border-blue-100 rounded-xl shadow-2xl py-3 px-4 z-50 min-w-[200px] animate-fadeIn"
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-red-600 font-semibold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
        >
          <FaSignOutAlt className="text-red-500" />
          Log out
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-14 right-0 bg-white border-2 border-blue-100 rounded-xl shadow-2xl py-3 px-4 z-50 min-w-[200px] animate-fadeIn"
    >
      {/* Header del dropdown */}
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <FaUser className="text-blue-600 text-sm" />
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Botón de log out */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 text-red-600 font-semibold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
      >
        <FaSignOutAlt className="text-red-500" />
        Log out
      </button>
    </div>
  );
} 
