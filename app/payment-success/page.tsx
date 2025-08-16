"use client";
import React, { useEffect, useRef } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const { clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Solo ejecutar una vez
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const updateOrderStatus = async () => {
      const userId = searchParams ? searchParams.get("userId") : null;
      const orderId = searchParams ? searchParams.get("orderId") : null;
      
      console.log("🔍 Payment success page loaded with params:", { userId, orderId });
      
      if (userId && orderId) {
        try {
          const response = await fetch(`/api/orders/update-status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId,
              status: "completed"
            }),
          });
          
          if (response.ok) {
            console.log("✅ Order status updated successfully");
          } else {
            console.log("❌ Failed to update order status");
          }
        } catch (error) {
          console.error("Error updating order status:", error);
        }
      } else {
        console.log("⚠️ Missing userId or orderId parameters");
      }
    };

    // Ejecutar solo una vez
    clearCart();
    localStorage.removeItem("cart");
    updateOrderStatus();
    
    // Redirige automáticamente a home después de 5 segundos
    const timer = setTimeout(() => {
      router.replace("/");
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []); // Dependencias vacías - solo se ejecuta una vez

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center">
        <svg className="w-20 h-20 text-green-500 mb-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4" />
        </svg>
        
        <h1 className="text-3xl font-bold text-green-700 mb-2 text-center">¡Pago Exitoso!</h1>
        <p className="text-gray-700 text-center mb-6">
          Gracias por tu compra. Tu pago ha sido procesado exitosamente.<br/>
          Un recibo ha sido enviado a tu email.
        </p>
        
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center font-semibold mb-6 animate-fadeIn">
          Serás redirigido a la página principal en 5 segundos...
        </div>
        
        <button 
          onClick={() => router.replace("/")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow transition"
        >
          Ir a Home
        </button>
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease; }
      `}</style>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <div>
      <PaymentSuccessContent />
    </div>
  );
}