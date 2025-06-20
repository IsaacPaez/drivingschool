"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const { clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showModal, setShowModal] = useState(true);
  const [orderUpdated, setOrderUpdated] = useState(false);
  useEffect(() => {
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
            setOrderUpdated(true);
          } else {
            console.log("❌ Failed to update order status");
          }
        } catch (error) {
          console.error("Error updating order status:", error);
        }
      } else {
        console.log("⚠️ Missing userId or orderId parameters");
        // Aún así mostrar éxito, pero sin actualizar orden específica
        setOrderUpdated(true);
      }
    };

    clearCart();
    localStorage.removeItem("cart");
    updateOrderStatus();
    
    // Redirige automáticamente a home después de 6 segundos
    const timer = setTimeout(() => {
      setShowModal(false);
      router.replace("/");
    }, 6000);
    
    return () => clearTimeout(timer);
  }, [clearCart, router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center">
        <svg className="w-20 h-20 text-green-500 mb-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4" /></svg>
        <h1 className="text-3xl font-bold text-green-700 mb-2 text-center">Payment Successful!</h1>
        <p className="text-gray-700 text-center mb-6">Thank you for your purchase. Your payment has been processed successfully.<br/>A receipt has been sent to your email.</p>
        {showModal && (
          <div className="mb-4 w-full flex flex-col items-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center font-semibold mb-2 animate-fadeIn">
              You will be redirected to the home page in a few seconds...
            </div>
          </div>
        )}
        <Link href="/">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow transition">Back to Home</button>
        </Link>
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