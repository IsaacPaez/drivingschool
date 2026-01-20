"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({
  className = "",
  label = "Back",
}) => {
  const router = useRouter();

  const onBack = () => {
    if (typeof window === "undefined") return;

    // Verificar si hay historial previo en el mismo sitio
    // Si el historial tiene solo 1 entrada o menos, ir a Home
    if (window.history.length <= 1) {
      router.push("/");
      return;
    }

    // Guardar flag en sessionStorage para hacer scroll al inicio en la página destino
    sessionStorage.setItem("scrollToTop", "true");

    // Navegar a la página anterior
    window.history.back();
  };

  return (
    <button
      onClick={onBack}
      className={`flex items-center px-4 py-2 bg-white border-2 border-green-600 rounded-md text-green-600 font-semibold text-base shadow hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-400 ${className}`}
      aria-label={label}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        className="mr-2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.5 15L8 10L12.5 5"
          stroke="#27ae60"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </button>
  );
};

export default BackButton;
