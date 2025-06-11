"use client";

import React, { useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/components/AuthContext";
import { FaShoppingCart, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

interface CartIconProps {
  color?: string;
}

const CartIcon: React.FC<CartIconProps> = ({ color = "black" }) => {
  const { cart, removeFromCart, clearCart, cartLoading } = useCart();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      setShowAuthWarning(true);
      return;
    }
    if (cart.length === 0) {
      alert("❌ Tu carrito está vacío.");
      return;
    }
    // Validación extra de productos
    const invalid = cart.some(item => !item.id || !item.title || typeof item.price !== 'number' || item.price <= 0 || typeof item.quantity !== 'number' || item.quantity <= 0);
    if (invalid) {
      alert("❌ Hay productos inválidos en tu carrito. El carrito será vaciado. Por favor, agrega los productos nuevamente.");
      localStorage.removeItem("cart");
      window.location.reload();
      return;
    }
    setLoading(true);
    try {
      // Llama al backend y espera la respuesta
      const res = await fetch(`/api/payments/redirect?userId=${user._id}`);
      if (!res.ok) {
        alert("❌ There was an error processing the payment. Please try again.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (data.redirectUrl) {
        clearCart();
        window.location.href = data.redirectUrl;
      } else {
        alert("Error en el pago. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("❌ Payment error:", error);
      alert("❌ There was an error processing the payment. Please try again.");
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
              <h2 className="text-xl font-bold dark:text-black">Your Cart</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <FaTimes size={24} />
              </button>
            </div>
            {/* Total y botón para vaciar carrito */}
            {cart.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold dark:text-black">Total: ${cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0).toFixed(2)}</span>
                <button
                  onClick={() => { localStorage.removeItem("cart"); window.location.reload(); }}
                  className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700 transition text-sm"
                >
                  Empty Cart
                </button>
              </div>
            )}

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center dark:text-black">
                Your cart is empty.
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
                        onClick={() => !cartLoading && removeFromCart(item.id)}
                        className={`ml-2 flex-shrink-0 text-red-500 text-lg hover:text-red-700 transition ${cartLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={cartLoading}
                        aria-label="Remove from cart"
                        style={{ minWidth: 32, minHeight: 32 }}
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
                  {loading ? "Processing..." : "Checkout"}
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
      {/* Modal de advertencia de autenticación */}
      {showAuthWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-600 max-w-md w-full p-8 relative animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-red-600 text-center">Authentication Required</h2>
            <p className="mb-4 text-center text-black">You must be logged in to checkout. Please sign in first.</p>
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded mx-auto block"
              onClick={() => setShowAuthWarning(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartIcon;
