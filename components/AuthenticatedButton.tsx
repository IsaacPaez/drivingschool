"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

/**
 * Describe los campos necesarios para la acción que se va a ejecutar.
 * Ajusta según tu lógica real.
 */
interface AuthenticatedButtonActionData {
  itemId?: string;
  title?: string;
  price?: number;
  // ...otros campos que necesites
}

interface AuthenticatedButtonProps {
  type: "buy" | "book" | "contact";
  actionData: AuthenticatedButtonActionData;
  label: string;
  redirectTo?: string; // URL de redirección opcional
  className?: string; // Clase CSS opcional
}

const AuthenticatedButton: React.FC<AuthenticatedButtonProps> = ({
  type,
  actionData,
  label,
  className = "",
}) => {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleClick = async () => {
    switch (type) {
      case "buy":
        if (
          actionData.itemId &&
          actionData.title &&
          actionData.price !== undefined
        ) {
          addToCart({
            id: actionData.itemId,
            title: actionData.title,
            price: actionData.price,
            quantity: 1,
          });
        }
        break;
      case "book":
        if (type === "book" || /book|schedule/i.test(label)) {
          router.push("/Book-Now");
          return;
        }
      case "contact":
        alert("📩 Abriendo formulario de contacto...");
        break;
      default:
        console.warn("Tipo de acción no reconocido:", type);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`px-6 py-3 rounded-lg font-semibold transition-all ${className}`}
    >
      {label}
    </button>
  );
};

export default AuthenticatedButton;
