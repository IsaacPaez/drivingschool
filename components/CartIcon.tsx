"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/components/AuthContext";
import { FaShoppingCart, FaTimes } from "react-icons/fa";
import { motion } from "framer-motion";

interface CartIconProps {
  color?: string;
}

// Component to show order details
const OrderDetailsComponent: React.FC<{ orderId: string }> = ({ orderId }) => {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/details?orderId=${orderId}`);
        if (response.ok) {
          const data = await response.json();
          setOrderDetails(data.order);
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-xs text-gray-500">Loading appointment details...</div>
      </div>
    );
  }

  if (!orderDetails) {
    return null;
  }

  return (
    <div className="bg-green-50 p-3 rounded-lg">
      <div className="text-sm text-green-800 font-medium mb-2">
        📅 Appointment Details
      </div>
      
      {/* Package Details */}
      {orderDetails.packageDetails && (
        <div className="mb-2">
          <div className="text-xs text-green-700">
            📦 {orderDetails.packageDetails.packageTitle}
          </div>
          <div className="text-xs text-green-600">
            📍 Pickup: {orderDetails.packageDetails.pickupLocation}
          </div>
          <div className="text-xs text-green-600">
            📍 Dropoff: {orderDetails.packageDetails.dropoffLocation}
          </div>
          <div className="text-xs text-green-600">
            ⏱️ Hours: {orderDetails.packageDetails.selectedHours} of {orderDetails.packageDetails.totalHours}
          </div>
        </div>
      )}

      {/* Appointments List */}
      {orderDetails.appointments && orderDetails.appointments.length > 0 && (
        <div>
          <div className="text-xs text-green-700 font-medium mb-1">
            📋 Scheduled Classes ({orderDetails.appointments.length}):
          </div>
          {orderDetails.appointments.map((apt: any, index: number) => (
            <div key={index} className="text-xs text-green-600 mb-1 pl-2 border-l-2 border-green-200">
              🧑‍🏫 {apt.instructorName} • 📅 {apt.date} • ⏰ {apt.start}-{apt.end}
              <br />
              <span className={`inline-block px-1 py-0.5 rounded text-[10px] ${
                apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {apt.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Payment Status */}
      <div className="text-xs text-green-600 mt-2 pt-2 border-t border-green-200">
        💳 Payment: {orderDetails.paymentStatus || 'pending'}
      </div>
    </div>
  );
};

const CartIcon: React.FC<CartIconProps> = ({ color = "black" }) => {
  const { cart, removeFromCart, clearCart, cartLoading } = useCart();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  // Debug log for cart state
  useEffect(() => {
    console.log('🛒 [CartIcon] Cart state changed:', cart);
  }, [cart]);

  // Force cart sync when component mounts (only once)
  useEffect(() => {
    if (user?._id) {
      console.log('🔄 [CartIcon] Force syncing cart with database...');
      fetch(`/api/cart/status?userId=${user._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('🔄 [CartIcon] Database cart items:', data.cartItems);
            if (data.cartItems.length === 0) {
              // If database is empty, clear local cart
              localStorage.removeItem("cart");
              window.location.reload();
            }
          }
        })
        .catch(err => {
          console.warn('[CartIcon] Failed to sync with database:', err);
        });
    }
  }, []); // NO DEPENDENCIES - only run once on mount
  const handleCheckout = async () => {
    // Prevent multiple simultaneous executions
    if (loading) {
      console.log("🔄 Checkout already in progress, ignoring duplicate call");
      return;
    }
    
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
      console.log("🛒 [DEBUG] Starting checkout process for user:", user._id);
      console.log("🛒 [DEBUG] Cart items:", cart);
      console.log("🛒 [DEBUG] Starting checkout at:", new Date().toISOString());
      
      // Proceed directly with payment redirect - /api/payments/redirect will handle order creation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
      
      const startTime = Date.now();
      // Llama al backend y espera la respuesta
      const res = await fetch(`/api/payments/redirect?userId=${user._id}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      console.log("🛒 [DEBUG] Request took:", endTime - startTime, "ms");
      console.log("🛒 [DEBUG] Response status:", res.status);
      
      if (!res.ok) {
        if (res.status === 504) {
          alert("⏰ El servidor está tardando en responder. Por favor, intenta nuevamente en unos momentos.");
          return;
        }
        const errorData = await res.text();
        console.error("🛒 [DEBUG] Error response:", errorData);
        alert("❌ There was an error processing the payment. Please try again.");
        return;
      }
      const data = await res.json();
      console.log("🛒 [DEBUG] Response data:", data);
      
      if (data.redirectUrl) {
        console.log("🛒 [DEBUG] Redirecting to payment gateway:", data.redirectUrl);
        console.log("🛒 [DEBUG] Cart will be cleared only after successful payment");
        window.location.href = data.redirectUrl;
      } else {
        console.error("🛒 [DEBUG] No redirectUrl in response:", data);
        alert("Error en el pago. Intenta de nuevo.");
      }
    } catch (error) {
      console.log("🛒 [DEBUG] Error occurred at:", new Date().toISOString());
      if (error.name === 'AbortError') {
        alert("⏰ La solicitud tardó demasiado tiempo. Por favor, intenta nuevamente.");
      } else {
        console.error("❌ Payment error:", error);
        alert("❌ There was an error processing the payment. Please try again.");
      }
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
            className="fixed left-0 top-0 h-full w-full sm:w-[28rem] bg-white shadow-lg p-6 z-50 overflow-auto"
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
                <span className="text-lg font-bold dark:text-black">
                  Total: ${isNaN(cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)) ? '0.00' : cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0).toFixed(2)}
                </span>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="text-center">
                <p className="text-gray-500 dark:text-black mb-4">
                  Your cart is empty.
                </p>
                
                {/* Botón de limpiar carrito siempre disponible */}
                <button
                  onClick={clearCart}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg flex items-center justify-center"
                  title="Clear all items from cart (in case of bugs)"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Cart (Debug)
                </button>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-gray-300">
                  {cart.map((item) => (
                    <li
                      key={item.id}
                      className="py-3 px-2 min-w-0"
                    >
                      {/* Item Title and Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-base mb-1">
                            {item.title}
                          </h3>
                          <p className="text-lg font-bold text-green-600">
                            ${item.price}
                          </p>
                        </div>
                        <button
                          onClick={() => !cartLoading && removeFromCart(item.id)}
                          className={`flex-shrink-0 w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-200 ${cartLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={cartLoading}
                          aria-label="Remove from cart"
                          title="Remove item from cart"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Order Details (if available) */}
                      {item.orderNumber && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-2">
                          <div className="text-sm text-blue-800 font-medium">
                            Order: {item.orderNumber}
                          </div>
                          {item.orderId && (
                            <div className="text-xs text-blue-600">
                              ID: {item.orderId}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Appointment Details (fetch from order if available) */}
                      {item.orderId && (
                        <OrderDetailsComponent orderId={item.orderId} />
                      )}

                      {/* Driving Test Details */}
                      {item.classType === 'driving test' && item.instructorName && item.date && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 shadow-sm">
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-green-900">
                                Driving Test Appointment
                              </h4>
                              <p className="text-xs text-green-600">
                                Ready for checkout
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-xs text-green-700">
                              <svg className="w-3 h-3 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="font-medium">Instructor:</span> {item.instructorName}
                            </div>
                            
                            <div className="flex items-center text-xs text-green-700">
                              <svg className="w-3 h-3 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium">Date:</span> {(() => {
                                // Parse the date string correctly to avoid timezone issues
                                const dateStr = item.date; // Should be in format "2025-09-02"
                                const [year, month, day] = dateStr.split('-').map(Number);
                                const date = new Date(year, month - 1, day); // month is 0-indexed
                                return date.toLocaleDateString('en-US', { 
                                  weekday: 'short', 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                });
                              })()}
                            </div>
                            
                            <div className="flex items-center text-xs text-green-700">
                              <svg className="w-3 h-3 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">Time:</span> {item.start} - {item.end}
                            </div>
                          </div>
                          
                          <div className="bg-green-100 p-2 rounded border-l-4 border-green-400">
                            <p className="text-xs text-green-800">
                              <span className="font-medium">Note:</span> Slot is reserved temporarily. Complete checkout to confirm your driving test.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Ticket Class Details */}
                      {item.ticketClassId && (
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-lg border border-red-200 shadow-sm">
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-red-900">
                                Traffic Law & Substance Abuse Class
                              </h4>
                              <p className="text-xs text-red-600">
                                Online course enrollment
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-xs text-red-700">
                              <svg className="w-3 h-3 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">Course Type:</span> Online Traffic Law Course
                            </div>
                            
                            <div className="flex items-center text-xs text-red-700">
                              <svg className="w-3 h-3 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">Duration:</span> 4 Hours
                            </div>

                            {/* Show selected slot date and time if available */}
                            {item.date && item.start && item.end && (
                              <>
                                <div className="flex items-center text-xs text-red-700">
                                  <svg className="w-3 h-3 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="font-medium">Date:</span> {(() => {
                                    try {
                                      let dateStr = item.date;
                                      
                                      // Handle ISO date format (2025-09-11T00:00:00.000Z)
                                      if (dateStr.includes('T')) {
                                        dateStr = dateStr.split('T')[0]; // Extract only the date part
                                      }
                                      
                                      // Parse the date string correctly to avoid timezone issues
                                      const [year, month, day] = dateStr.split('-').map(Number);
                                      const date = new Date(year, month - 1, day); // month is 0-indexed
                                      
                                      return date.toLocaleDateString('en-US', { 
                                        weekday: 'short', 
                                        year: 'numeric', 
                                        month: 'short', 
                                        day: 'numeric' 
                                      });
                                    } catch (error) {
                                      console.error('Error parsing date:', item.date, error);
                                      return 'Invalid Date';
                                    }
                                  })()}
                                </div>
                                
                                <div className="flex items-center text-xs text-red-700">
                                  <svg className="w-3 h-3 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="font-medium">Time:</span> {item.start} - {item.end}
                                </div>
                              </>
                            )}
                            
                            <div className="flex items-center text-xs text-red-700">
                              <svg className="w-3 h-3 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="font-medium">Access:</span> Immediate after payment
                            </div>
                          </div>
                          
                          <div className="bg-red-100 p-2 rounded border-l-4 border-red-400">
                            <p className="text-xs text-red-800">
                              <span className="font-medium">Note:</span> Course access will be provided via email after successful payment completion.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Package Details (for driving lessons without order yet) */}
                      {!item.orderId && item.packageDetails && item.selectedSlots && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-blue-900">
                                Driving Lesson Package
                              </h4>
                              <p className="text-xs text-blue-600">
                                Order will be created at checkout
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            <div className="flex items-start">
                              <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div className="text-xs text-blue-700">
                                <span className="font-medium">Pickup:</span> {item.packageDetails.pickupLocation}
                              </div>
                            </div>
                            <div className="flex items-start">
                              <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <div className="text-xs text-blue-700">
                                <span className="font-medium">Dropoff:</span> {item.packageDetails.dropoffLocation}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div className="text-xs text-blue-700">
                                <span className="font-medium">Hours:</span> {item.packageDetails.totalHours} total | {item.packageDetails.selectedHours} selected
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <h5 className="text-xs font-semibold text-blue-800 mb-2">
                              Selected Time Slots ({item.selectedSlots?.length || 0})
                            </h5>
                            <div className="space-y-1">
                              {item.slotDetails && item.slotDetails.length > 0 ? (
                                // Use detailed slot information if available
                                item.slotDetails.map((slotDetail: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                                    <div className="flex flex-col space-y-1">
                                      <div className="flex items-center">
                                        <svg className="w-3 h-3 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs text-blue-800 font-medium">{slotDetail.date}</span>
                                        <span className="text-xs text-blue-600 mx-2">•</span>
                                        <span className="text-xs text-blue-700 font-semibold">{slotDetail.start} - {slotDetail.end}</span>
                                      </div>
                                      <div className="flex items-center ml-5">
                                        <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-xs text-green-700 font-medium">{slotDetail.instructorName}</span>
                                      </div>
                                    </div>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      PENDING
                                    </span>
                                  </div>
                                ))
                              ) : (
                                // Fallback to basic slot information
                                item.selectedSlots?.map((slot: string, index: number) => {
                                  const [date, start, end] = slot.split('-');
                                  return (
                                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-100">
                                      <div className="flex items-center">
                                        <svg className="w-3 h-3 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-xs text-blue-800 font-medium">{date}</span>
                                        <span className="text-xs text-blue-600 mx-2">•</span>
                                        <span className="text-xs text-blue-700 font-semibold">{start} - {end}</span>
                                      </div>
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        PENDING
                                      </span>
                                    </div>
                                  );
                                }) || []
                              )}
                            </div>
                          </div>
                          
                          <div className="bg-blue-100 p-2 rounded border-l-4 border-blue-400">
                            <p className="text-xs text-blue-800">
                              <span className="font-medium">Note:</span> Slots are reserved temporarily. Complete checkout to confirm your booking.
                            </p>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                
                {/* Botón de limpiar carrito */}
                <button
                  onClick={clearCart}
                  className="w-full bg-red-500 hover:bg-red-600 text-white mt-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg flex items-center justify-center"
                  title="Clear all items from cart"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Cart
                </button>
                
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white mt-2 py-3 rounded-lg disabled:opacity-50 transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Proceed to Checkout
                    </>
                  )}
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
