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

    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    let isConnecting = false;

    const connectSSE = () => {
      if (isConnecting) return; // Prevent multiple simultaneous connections
      isConnecting = true;

      try {
        // Close existing connection if any
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        eventSource = new EventSource(`/api/cart/updates?userId=${user._id}`);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'update' && data.cart && Array.isArray(data.cart.items)) {
          setCart(data.cart.items);
        }
      } catch (error) {
            console.warn("Failed to parse cart SSE data:", error);
      }
    };

    eventSource.onerror = (err) => {
          console.warn("Cart EventSource error:", err);
          isConnecting = false;
          
          if (eventSource) {
            try {
      eventSource.close();
            } catch (closeError) {
              // Ignore close errors
            }
            eventSource = null;
          }
          
          // Implement reconnection logic
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000); // Exponential backoff, max 10s
            reconnectTimeout = setTimeout(() => {
              connectSSE();
            }, delay);
          }
        };

        eventSource.onopen = () => {
          console.log("Cart SSE connection established");
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          isConnecting = false;
        };

      } catch (error) {
        console.warn("Failed to create EventSource:", error);
        isConnecting = false;
        
        // Implement reconnection logic for creation errors
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
          reconnectTimeout = setTimeout(() => {
            connectSSE();
          }, delay);
        }
      }
    };

    connectSSE();

    // Cleanup on component unmount or user change
    return () => {
      isConnecting = false;
      if (eventSource) {
        try {
      eventSource.close();
        } catch (error) {
          // Ignore close errors
        }
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
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
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user._id, items: cartItems }),
        });
        
        if (!response.ok) {
          console.warn("[CartContext] Failed to save cart to DB:", response.status, response.statusText);
        }
      } catch (err) {
        console.warn("[CartContext] Failed to save cart to DB:", err);
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
