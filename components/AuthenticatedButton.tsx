"use client";

import React, { useState } from "react";
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
  const { addToCart, reloadCartFromDB, cartLoading } = useCart();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading || added || cartLoading) return;
    switch (type) {
      case "buy":
        if (
          actionData.itemId &&
          actionData.title &&
          actionData.price !== undefined
        ) {
          setLoading(true);
          await addToCart({
            id: actionData.itemId,
            title: actionData.title,
            price: actionData.price,
            quantity: 1,
          });
          await reloadCartFromDB();
          setAdded(true);
          setLoading(false);
          setTimeout(() => setAdded(false), 1200);
        }
        break;
      case "book":
        if (type === "book" || /book|schedule/i.test(label)) {
          router.push("/Book-Now");
          return;
        }
      case "contact":
        alert("📩 Opening contact form...");
        break;
      default:
        console.warn("Unknown action type:", type);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`px-6 py-3 rounded-lg font-semibold transition-all relative overflow-hidden ${className}`}
      disabled={loading || added || cartLoading}
      style={{ minWidth: 140 }}
    >
      {added ? (
        <span className="flex items-center justify-center gap-2 animate-fadeIn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#27ae60" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 10 18 4 12" /></svg>
          <span className="font-bold text-[#27ae60]">Added to cart!</span>
        </span>
      ) : loading ? (
        <span className="flex items-center justify-center gap-2 animate-fadeIn">
          <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0056b3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" stroke="#0056b3" strokeWidth="3" fill="none" opacity="0.2"/><path d="M12 2a10 10 0 0 1 10 10" stroke="#0056b3" strokeWidth="3"/></svg>
          <span className="font-bold text-white">Adding...</span>
        </span>
      ) : (
        <span>{label}</span>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease; }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default AuthenticatedButton;
