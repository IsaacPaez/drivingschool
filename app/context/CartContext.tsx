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
  orderId?: string;
  orderNumber?: string;
  packageDetails?: {
    productId: string;
    packageTitle: string;
    packagePrice: number;
    totalHours: number;
    selectedHours: number;
    pickupLocation: string;
    dropoffLocation: string;
  };
  selectedSlots?: string[];
  instructorData?: any[];
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

  // Sync cart with database when user is available (only once)
  useEffect(() => {
    if (user?._id) {
      console.log('🔄 [CartContext] Syncing cart with database for user:', user._id);
      // Check cart status from database
      fetch(`/api/cart/status?userId=${user._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('🔄 [CartContext] Database cart items:', data.cartItems);
            if (data.cartItems.length > 0) {
              console.log('🔄 [CartContext] Found items in database, syncing with local state');
              setCart(data.cartItems);
            } else {
              // If database is empty, clear local cart too
              console.log('🔄 [CartContext] Database is empty, clearing local cart');
              setCart([]);
              localStorage.removeItem("cart");
            }
          }
        })
        .catch(err => {
          console.warn('[CartContext] Failed to sync with database:', err);
        });
    }
  }, []); // NO DEPENDENCIES - only run once on mount

  // 🔄 SSE Connection for real-time cart updates - TEMPORARILY DISABLED
  useEffect(() => {
    if (!user?._id) return;
    
    // TEMPORARILY DISABLE SSE TO STOP INFINITE LOOP
    console.log('🔄 SSE temporarily disabled to stop infinite loop');
    return;

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

        console.log('🛒 Connecting to cart SSE for user:', user._id);
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
            console.log(`🔄 Cart SSE reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
            reconnectTimeout = setTimeout(() => {
              connectSSE();
            }, delay);
          } else {
            console.error('❌ Cart SSE failed to reconnect after multiple attempts');
          }
        };

        eventSource.onopen = () => {
          console.log("✅ Cart SSE connection established");
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          isConnecting = false;
        };

      } catch (error) {
        console.warn("Failed to create Cart EventSource:", error);
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
    console.log('🛒 [CartContext] Adding item to cart:', item);
    let newCart: CartItem[] = [];
    setCart((prevCart) => {
      if (prevCart.find((cartItem) => cartItem.id === item.id)) {
        console.log('🛒 [CartContext] Item already in cart, skipping');
        newCart = prevCart;
        return prevCart;
      }
      newCart = [...prevCart, { ...item, quantity: 1 }];
      console.log('🛒 [CartContext] New cart state:', newCart);
      return newCart;
    });
    
    // For driving lesson packages, don't save to DB here since the endpoint already does it
    if (!item.selectedSlots) {
      // Use a short timeout to allow state to update before saving
      setTimeout(() => saveCartToDB(newCart), 50);
    } else {
      console.log('🛒 [CartContext] Driving lesson package - skipping DB save (already done by endpoint)');
    }
  };
  
  const removeFromCart = async (id: string) => {
    if (!user?._id) return;

    // Find the item to remove first to check if it has selectedSlots
    const itemToRemove = cart.find(item => item.id === id);
    
    if (itemToRemove && itemToRemove.selectedSlots && itemToRemove.selectedSlots.length > 0) {
      // This is a driving lesson package - free slots first
      console.log('🗑️ Removing driving lesson package and freeing slots...');
      
      try {
        const response = await fetch("/api/cart/remove-driving-lesson-package", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            userId: user._id, 
            itemId: id, 
            selectedSlots: itemToRemove.selectedSlots 
          }),
        });

        if (response.ok) {
          let updatedCart: CartItem[] = [];
          setCart((prevCart) => {
            updatedCart = prevCart.filter((item) => item.id !== id);
            return updatedCart;
          });
          setTimeout(() => saveCartToDB(updatedCart), 50);
          console.log("✅ Driving lesson package removed and slots freed");
          
          // Trigger a page refresh to show updated slot statuses
          setTimeout(() => {
            console.log("🔄 Triggering page refresh to show freed slots...");
            window.location.reload();
          }, 1000);
        } else {
          const errorData = await response.json();
          console.error("❌ Failed to remove driving lesson package:", errorData.error);
          alert(`Error removing package: ${errorData.error}`);
        }
      } catch (error) {
        console.error("❌ Error removing driving lesson package:", error);
        alert('Error removing package from cart');
      }
    } else {
      // Regular cart item - just remove from cart
      let updatedCart: CartItem[] = [];
      setCart((prevCart) => {
        updatedCart = prevCart.filter((item) => item.id !== id);
        return updatedCart;
      });
      setTimeout(() => saveCartToDB(updatedCart), 50);
    }
  };

  const clearCart = async () => {
    console.log('🗑️ [CartContext] Clearing cart completely...');
    setCart([]);
    localStorage.removeItem("cart");
    
    // Also clear from database
    if (user?._id) {
      try {
        await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user._id }),
        });
        console.log('✅ [CartContext] Cart cleared from database');
      } catch (err) {
        console.warn('[CartContext] Failed to clear cart from database:', err);
      }
    }
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
