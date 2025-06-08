"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/components/AuthContext";

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth();

  // 🛒 Cargar el carrito desde localStorage al iniciar (solo si está vacío)
  useEffect(() => {
    if (cart.length === 0) {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 💾 Guardar el carrito en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // 🔄 Sincronizar el carrito entre pestañas
  useEffect(() => {
    const syncCart = (e: StorageEvent) => {
      if (e.key === "cart") {
        setCart(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };
    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, []);

  // Save cart to DB every time it changes and user is logged in
  useEffect(() => {
    async function saveCartToDB() {
      if (user && user._id && cart.length > 0) {
        try {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user._id, items: cart }),
          });
        } catch (err) {
          console.error("[CartContext] Failed to save cart to DB:", err);
        }
      }
    }
    saveCartToDB();
  }, [cart, user]);

  // 🚀 Función para agregar productos al carrito
  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        // Si ya existe, no hacer nada (solo uno por producto)
        return prevCart;
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // ❌ Función para eliminar un producto del carrito
  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // 🧹 Función para vaciar el carrito
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 📌 Hook para usar el contexto del carrito
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
};
