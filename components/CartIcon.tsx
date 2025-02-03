"use client";

import React, { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";

interface CartIconProps {
  color?: string; // ✅ Aseguramos que `color` sea una propiedad opcional
}

const CartIcon: React.FC<CartIconProps> = ({ color = "black" }) => {
  const { cart, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

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
            <p className="text-gray-500 text-center">Tu carrito está vacío.</p>
          ) : (
            <>
              <ul>
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className="flex justify-between py-2 border-b"
                  >
                    <span>{item.title}</span>
                    <span className="font-bold">${item.price}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 text-sm"
                    >
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
              <Link href="/checkout">
                <button className="w-full bg-green-500 text-white mt-4 py-2 rounded-lg">
                  Checkout
                </button>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CartIcon;
