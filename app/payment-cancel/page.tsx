"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";

export default function PaymentCancel() {
  const { clearCart } = useCart();
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    clearCart();
    localStorage.removeItem("cart");
    // Redirige automáticamente a home después de 6 segundos
    const timer = setTimeout(() => {
      setShowModal(false);
      router.replace("/");
    }, 6000);
    return () => clearTimeout(timer);
  }, [clearCart, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-100 to-yellow-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center">
        <svg className="w-20 h-20 text-yellow-500 mb-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" /></svg>
        <h1 className="text-3xl font-bold text-yellow-700 mb-2 text-center">Payment Cancelled</h1>
        <p className="text-gray-700 text-center mb-6">Your payment was not completed. If you wish to try again, please return to the checkout page.</p>
        {showModal && (
          <div className="mb-4 w-full flex flex-col items-center">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative text-center font-semibold mb-2 animate-fadeIn">
              You will be redirected to the home page in a few seconds...
            </div>
          </div>
        )}
        <Link href="/">
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg shadow transition">Back to Home</button>
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