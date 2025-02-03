"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUser, SignInButton, SignedOut, SignedIn } from "@clerk/nextjs";
import { useCart } from "@/app/context/CartContext";

interface AuthenticatedButtonProps {
  type: "buy" | "book" | "contact";
  actionData: any;
  label: string;
  redirectTo?: string; // ✅ Hacemos redirectTo opcional
  className?: string;
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
    if (!user) return;

    switch (type) {
      case "buy":
        addToCart({
          id: actionData.itemId,
          title: actionData.title,
          price: actionData.price,
          quantity: 1,
        });
        break;

      case "book":
        if (redirectTo) {
          router.push(redirectTo); // ✅ Redirigir a la página correspondiente
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
      {/* Si el usuario no está autenticado, muestra el botón de inicio de sesión */}
      <SignedOut>
        <SignInButton mode="modal">
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${className}`}
          >
            {label}
          </button>
        </SignInButton>
      </SignedOut>

      {/* Si el usuario está autenticado, muestra el botón funcional */}
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
