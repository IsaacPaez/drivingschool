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
  cartLoading: boolean;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => void;
  reloadCartFromDB: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from localStorage on initial load
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error("Error parsing cart from localStorage", e);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Sync with SSE when user logs in
  useEffect(() => {
    if (!user || !user._id) {
      // If user logs out, keep cart from localStorage
      const storedCart = localStorage.getItem("cart");
      setCart(storedCart ? JSON.parse(storedCart) : []);
      return;
    }

    const eventSource = new EventSource(`/api/cart/updates?userId=${user._id}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'update' && data.cart && Array.isArray(data.cart.items)) {
          setCart(data.cart.items);
        }
      } catch (error) {
        console.error("Failed to parse cart SSE data:", error);
      }
    };

    eventSource.onerror = (err) => {
      console.error("Cart EventSource failed:", err);
      eventSource.close();
    };

    // Cleanup on component unmount or user change
    return () => {
      eventSource.close();
    };
  }, [user]);

  // 💾 Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // DB persistence function
  const saveCartToDB = async (cartItems: CartItem[]) => {
    if (user && user._id) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user._id, items: cartItems }),
        });
      } catch (err) {
        console.error("[CartContext] Failed to save cart to DB:", err);
      }
    }
  };

  const addToCart = async (item: CartItem) => {
    let newCart: CartItem[] = [];
    setCart((prevCart) => {
      if (prevCart.find((cartItem) => cartItem.id === item.id)) {
        newCart = prevCart;
        return prevCart;
      }
      newCart = [...prevCart, { ...item, quantity: 1 }];
      return newCart;
    });
    // Use a short timeout to allow state to update before saving
    setTimeout(() => saveCartToDB(newCart), 50);
  };
  
  const removeFromCart = async (id: string) => {
    let updatedCart: CartItem[] = [];
    setCart((prevCart) => {
      updatedCart = prevCart.filter((item) => item.id !== id);
      return updatedCart;
    });
    setTimeout(() => saveCartToDB(updatedCart), 50);
  };

  const clearCart = () => {
    setCart([]);
    setTimeout(() => saveCartToDB([]), 50);
  };
  
  const reloadCartFromDB = () => {
    // This function is now effectively handled by the SSE connection.
    // It can be kept for specific manual refresh scenarios if needed, but is not essential for sync.
  };

  return (
    <CartContext.Provider
      value={{ cart, cartLoading, addToCart, removeFromCart, clearCart, reloadCartFromDB }}
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
