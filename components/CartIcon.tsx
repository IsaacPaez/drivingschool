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
      console.log("🛒 [DEBUG] Starting checkout process for user:", user._id);
      console.log("🛒 [DEBUG] Cart items:", cart);
      console.log("🛒 [DEBUG] Starting checkout at:", new Date().toISOString());
      
      // Step 1: Create orders for any driving lesson packages that don't have orders yet
      const packagesWithoutOrders = cart.filter(item => 
        !item.orderId && item.packageDetails && item.selectedSlots
      );
      
      if (packagesWithoutOrders.length > 0) {
        console.log(`🔄 Creating orders for ${packagesWithoutOrders.length} driving lesson packages...`);
        
        for (const packageItem of packagesWithoutOrders) {
          try {
            // Prepare appointments data from selected slots  
            const appointments: any[] = [];
            
            if (packageItem.selectedSlots && packageItem.instructorData) {
              packageItem.selectedSlots.forEach(slotKey => {
                const [date, start, end] = slotKey.split('-');
                
                // Find instructor for this slot
                for (const instructor of packageItem.instructorData) {
                  const lesson = instructor.schedule_driving_lesson?.find((l: any) => {
                    const lessonKey = `${l.date}-${l.start}-${l.end}`;
                    return lessonKey === slotKey;
                  });
                  if (lesson) {
                    appointments.push({
                      instructorId: instructor._id,
                      instructorName: instructor.name,
                      date: lesson.date,
                      start: lesson.start,
                      end: lesson.end,
                      classType: 'driving_lesson',
                      amount: packageItem.packageDetails!.packagePrice / (packageItem.packageDetails!.totalHours || 1)
                    });
                    break;
                  }
                }
              });
            }

            if (appointments.length === 0) {
              console.warn(`❌ No appointments found for package ${packageItem.title}`);
              continue;
            }

            // Create order
            const orderData = {
              userId: user._id,
              orderType: 'driving_lesson_package',
              appointments: appointments,
              packageDetails: packageItem.packageDetails,
              items: [{
                id: packageItem.id,
                title: packageItem.title,
                price: packageItem.price,
                quantity: 1
              }],
              total: packageItem.price,
              paymentMethod: 'online'
            };

            const orderRes = await fetch('/api/orders/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(orderData),
            });

            if (orderRes.ok) {
              const orderResult = await orderRes.json();
              console.log(`✅ Order created for package ${packageItem.title}:`, orderResult.order.orderNumber);
            } else {
              const errorData = await orderRes.json();
              console.error(`❌ Failed to create order for package ${packageItem.title}:`, errorData.error);
              alert(`Error creating order for ${packageItem.title}: ${errorData.error}`);
              return;
            }
          } catch (error) {
            console.error(`❌ Error creating order for package ${packageItem.title}:`, error);
            alert(`Error creating order for ${packageItem.title}. Please try again.`);
            return;
          }
        }
        
        console.log("✅ All orders created successfully");
      }
      
      // Step 2: Proceed with payment redirect
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
        console.log("🛒 [DEBUG] Clearing cart and redirecting to:", data.redirectUrl);
        clearCart();
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
                      className="py-3 px-2 min-w-0"
                    >
                      {/* Item Title and Price */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex-1 truncate text-left dark:text-black font-semibold">
                          {item.title}
                        </span>
                        <span className="ml-2 flex-shrink-0 text-right font-bold dark:text-black text-lg">
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
                      </div>

                      {/* Order Details (if available) */}
                      {item.orderNumber && (
                        <div className="bg-blue-50 p-3 rounded-lg mb-2">
                          <div className="text-sm text-blue-800 font-medium">
                            📋 Order: {item.orderNumber}
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

                      {/* Package Details (for driving lessons without order yet) */}
                      {!item.orderId && item.packageDetails && item.selectedSlots && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <div className="text-sm text-yellow-800 font-medium mb-2">
                            📦 Package Details (Order will be created at checkout)
                          </div>
                          <div className="text-xs text-yellow-700 mb-2">
                            📍 Pickup: {item.packageDetails.pickupLocation}
                            <br />
                            📍 Dropoff: {item.packageDetails.dropoffLocation}
                            <br />
                            ⏱️ Total Hours: {item.packageDetails.totalHours} hrs | Selected: {item.packageDetails.selectedHours} hrs
                          </div>
                          <div className="text-xs text-yellow-700 mb-1">
                            📋 Selected Time Slots ({item.selectedSlots.length}):
                          </div>
                          {item.selectedSlots.map((slot: string, index: number) => {
                            const [date, start, end] = slot.split('-');
                            return (
                              <div key={index} className="text-xs text-yellow-600 mb-1 pl-2 border-l-2 border-yellow-200">
                                📅 {date} • ⏰ {start}-{end}
                                <br />
                                <span className="inline-block px-1 py-0.5 rounded text-[10px] bg-yellow-100 text-yellow-700">
                                  PENDING (Not paid yet)
                                </span>
                              </div>
                            );
                          })}
                          <div className="text-xs text-yellow-600 mt-2 pt-2 border-t border-yellow-200">
                            ⚠️ Slots are reserved temporarily. Complete checkout to confirm.
                          </div>
                        </div>
                      )}
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
