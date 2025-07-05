"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { FaBell, FaCar, FaSignOutAlt, FaUser } from "react-icons/fa";

interface UserDropdownProps {
  onClose: () => void;
}

export default function UserDropdown({ onClose }: UserDropdownProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [classReminder, setClassReminder] = useState(false);
  const [drivingTestReminder, setDrivingTestReminder] = useState(false);
  const [loading, setLoading] = useState(false);
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

  // Cargar preferencias del usuario
  useEffect(() => {
    if (user?._id) {
      fetchPreferences();
    }
  }, [user?._id]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`/api/users/preferences?userId=${user?._id}`);
      if (response.ok) {
        const data = await response.json();
        setClassReminder(data.classReminder || false);
        setDrivingTestReminder(data.drivingTestReminder || false);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  const updatePreferences = async (field: string, value: boolean) => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/users/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          [field]: value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      // Revertir el cambio si falla
      if (field === "classReminder") {
        setClassReminder(!value);
      } else if (field === "drivingTestReminder") {
        setDrivingTestReminder(!value);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClassReminderChange = (checked: boolean) => {
    setClassReminder(checked);
    updatePreferences("classReminder", checked);
  };

  const handleDrivingTestReminderChange = (checked: boolean) => {
    setDrivingTestReminder(checked);
    updatePreferences("drivingTestReminder", checked);
  };

  const handleLogout = () => {
    logout();
    router.replace("/");
    onClose();
  };

  // Solo mostrar para usuarios regulares (no instructores)
  if (!user || (user as any).type === "instructor") {
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
      className="absolute top-14 right-0 bg-white border-2 border-blue-100 rounded-xl shadow-2xl py-4 px-5 z-50 min-w-[280px] animate-fadeIn"
    >
      {/* Header del dropdown */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <FaUser className="text-blue-600 text-sm" />
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Sección de recordatorios */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaBell className="text-blue-500" />
          Reminders
        </h3>
        
        <div className="space-y-3">
          {/* Recordatorio de clases */}
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={classReminder}
              onChange={(e) => handleClassReminderChange(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <div className="flex items-center gap-2">
              <FaBell className="text-green-500 text-sm" />
              <span className="text-sm text-gray-700">Clases</span>
            </div>
          </label>

          {/* Recordatorio de driving test */}
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={drivingTestReminder}
              onChange={(e) => handleDrivingTestReminderChange(e.target.checked)}
              disabled={loading}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <div className="flex items-center gap-2">
              <FaCar className="text-orange-500 text-sm" />
              <span className="text-sm text-gray-700">Driving Test</span>
            </div>
          </label>
        </div>
      </div>

      {/* Botón de log out */}
      <div className="pt-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 text-red-600 font-semibold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
        >
          <FaSignOutAlt className="text-red-500" />
          Log out
        </button>
      </div>
    </div>
  );
} 