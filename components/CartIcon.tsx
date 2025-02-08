"use client";

import React, { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";

interface CartIconProps {
  color?: string;
}

const CartIcon: React.FC<CartIconProps> = ({ color = "black" }) => {
  const { cart, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("❌ No hay productos en el carrito.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });

      if (!res.ok) {
        throw new Error("Error en la respuesta del servidor.");
      }

      const { url } = await res.json();

      if (url) {
        window.location.href = url; // 🔹 Redirigir a Stripe Checkout
      } else {
        alert("❌ Error al procesar el pago.");
      }
    } catch (error) {
      console.error("❌ Error en la solicitud:", error);
      alert("❌ Hubo un error al procesar el pago. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Ícono del Carrito */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative transition"
        whileTap={{ scale: 0.9 }}
      >
        <FaShoppingCart size={24} style={{ color }} />
        {cart.length > 0 && (
          <motion.span
            className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5 }}
          >
            {cart.length}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown del Carrito */}
      {isOpen && (
        <div className="absolute right-0 mt-2 bg-white shadow-lg p-4 rounded-lg w-72 z-50">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center dark-text-black">
              Tu carrito está vacío.
            </p>
          ) : (
            <>
              {/* Lista de productos en el carrito */}
              <ul className="divide-y divide-gray-300">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-2 px-2"
                  >
                    {/* Nombre del producto alineado a la izquierda */}
                    <span className="w-2/3 truncate text-left dark:text-black">
                      {item.title}
                    </span>

                    {/* Precio alineado a la derecha en una columna */}
                    <span className="w-1/6 text-right font-bold dark:text-black">
                      ${item.price}
                    </span>

                    {/* Botón de eliminar a la derecha */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-1/6 text-red-500 text-lg hover:text-red-700 transition"
                    >
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleCheckout}
                className="w-full bg-green-500 text-white mt-4 py-2 rounded-lg"
                disabled={loading}
              >
                {loading ? "Procesando..." : "Checkout"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartIcon;
