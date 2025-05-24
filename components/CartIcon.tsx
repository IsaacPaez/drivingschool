"use client";

import React, { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { FaShoppingCart, FaTimes } from "react-icons/fa";
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
      if (!res.ok) throw new Error("Error en la respuesta del servidor.");
      const { url } = await res.json();
      if (url) window.location.href = url;
      else alert("❌ Error al procesar el pago.");
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
        {isOpen ? (
          <FaTimes size={24} style={{ color }} />
        ) : (
          <FaShoppingCart size={24} style={{ color }} />
        )}
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

      {/* Sidebar del Carrito */}
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed left-0 top-0 h-full w-full sm:w-96 bg-white shadow-lg p-6 z-50 overflow-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold dark:text-black">Tu Carrito</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center dark:text-black">
                Tu carrito está vacío.
              </p>
            ) : (
              <>
                <ul className="divide-y divide-gray-300">
                  {cart.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between py-3 px-2 min-w-0"
                    >
                      <span className="flex-1 truncate text-left dark:text-black">
                        {item.title}
                      </span>
                      <span className="ml-2 flex-shrink-0 text-right font-bold dark:text-black">
                        ${item.price}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 flex-shrink-0 text-red-500 text-lg hover:text-red-700 transition"
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-500 hover:bg-green-600 text-white mt-6 py-3 rounded-lg disabled:opacity-50 transition"
                  disabled={loading}
                >
                  {loading ? "Procesando..." : "Checkout"}
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default CartIcon;
