"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton, SignedOut, SignedIn } from "@clerk/nextjs";
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
  className?: string;  // Clase CSS opcional
}

const AuthenticatedButton: React.FC<AuthenticatedButtonProps> = ({
  type,
  actionData,
  label,
  redirectTo,
  className = "",
}) => {
  const router = useRouter();
  const { user } = useUser();
  const { addToCart } = useCart();

  const handleClick = async () => {
    // Verificamos si existe usuario
    if (!user) return;

    switch (type) {
      case "buy":
        // Aseguramos que actionData tenga lo necesario
        if (
          actionData.itemId &&
          actionData.title &&
          actionData.price !== undefined
        ) {
          addToCart({
            id: actionData.itemId,
            title: actionData.title,
            price: actionData.price,
            quantity: 1, // Valor fijo de ejemplo
          });
        }
        break;

      case "book":
        // Redirigimos si hay un redirectTo
        if (redirectTo) {
          router.push(redirectTo);
        }
        break;

      case "contact":
        alert("📩 Abriendo formulario de contacto...");
        break;

      default:
        console.warn("Tipo de acción no reconocido:", type);
    }
  };

  return (
    <>
      {/* Si el usuario NO está autenticado, se muestra botón para iniciar sesión */}
      <SignedOut>
        <SignInButton mode="modal">
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${className}`}
          >
            {label}
          </button>
        </SignInButton>
      </SignedOut>

      {/* Si el usuario SÍ está autenticado, se muestra el botón funcional */}
      <SignedIn>
        <button
          onClick={handleClick}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${className}`}
        >
          {label}
        </button>
      </SignedIn>
    </>
  );
};

export default AuthenticatedButton;
