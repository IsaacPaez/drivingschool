"use client";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { useCart } from "@/app/context/CartContext";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const { clearCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasInitialized = useRef(false);
  const [countdown, setCountdown] = useState(5);
  const [transactionStatus, setTransactionStatus] = useState<string>("checking");
  const [orderStatus, setOrderStatus] = useState<string>("pending");

  useEffect(() => {
    // Solo ejecutar una vez
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const checkTransactionAndUpdateOrder = async () => {
      const userId = searchParams ? searchParams.get("userId") : null;
      const orderId = searchParams ? searchParams.get("orderId") : null;
      
      console.log("🔍 Payment success page loaded with params:", { userId, orderId });
      
      if (userId && orderId) {
        try {
          // Verificar estado de la transacción
          console.log("🔍 Checking transaction status for order:", orderId);
          const transactionResponse = await fetch(`/api/transactions/check-status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId }),
          });
          
          if (transactionResponse.ok) {
            const transactionData = await transactionResponse.json();
            console.log("📊 Transaction status:", transactionData);
            
            if (transactionData.success) {
              setTransactionStatus("approved");
              setOrderStatus("completed");
              console.log("✅ Order updated to completed based on approved transaction");
            } else {
              setTransactionStatus("pending");
              setOrderStatus("pending");
              console.log("⏳ Transaction not approved yet:", transactionData.message);
            }
          } else {
            console.log("❌ Failed to check transaction status");
            setTransactionStatus("error");
          }
        } catch (error) {
          console.error("Error checking transaction status:", error);
          setTransactionStatus("error");
        }
      } else {
        console.log("⚠️ Missing userId or orderId parameters");
        setTransactionStatus("error");
      }
    };

    // Ejecutar solo una vez
    clearCart();
    localStorage.removeItem("cart");
    checkTransactionAndUpdateOrder();
    
    // Countdown de 5 segundos
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          router.replace("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownTimer);
  }, []); // Dependencias vacías - solo se ejecuta una vez

  const getStatusIcon = () => {
    switch (transactionStatus) {
      case "approved":
        return (
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4" />
            </svg>
          </div>
        );
      case "pending":
        return (
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-16 h-16 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
        );
    }
  };

  const getStatusMessage = () => {
    switch (transactionStatus) {
      case "approved":
        return {
          title: "¡Pago Aprobado!",
          subtitle: "Tu transacción ha sido confirmada exitosamente",
          description: "Tu orden ha sido marcada como completada y recibirás un recibo por email.",
          statusClass: "text-green-600",
          bgClass: "bg-green-50 border-green-200"
        };
      case "pending":
        return {
          title: "Pago en Proceso",
          subtitle: "Tu pago está siendo procesado",
          description: "Estamos verificando tu transacción. Esto puede tomar unos minutos.",
          statusClass: "text-yellow-600",
          bgClass: "bg-yellow-50 border-yellow-200"
        };
      case "error":
        return {
          title: "Error en Verificación",
          subtitle: "No pudimos verificar tu transacción",
          description: "Por favor contacta a soporte si tienes alguna pregunta.",
          statusClass: "text-red-600",
          bgClass: "bg-red-50 border-red-200"
        };
      default:
        return {
          title: "Verificando Pago...",
          subtitle: "Estamos procesando tu información",
          description: "Por favor espera mientras verificamos tu transacción.",
          statusClass: "text-blue-600",
          bgClass: "bg-blue-50 border-blue-200"
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full flex flex-col items-center text-center">
        {getStatusIcon()}
        
        <h1 className={`text-4xl font-bold mb-3 ${statusInfo.statusClass}`}>
          {statusInfo.title}
        </h1>
        
        <p className="text-xl text-gray-600 mb-2">
          {statusInfo.subtitle}
        </p>
        
        <p className="text-gray-500 mb-8 leading-relaxed">
          {statusInfo.description}
        </p>
        
        <div className={`${statusInfo.bgClass} border rounded-xl p-4 mb-8 w-full`}>
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-semibold text-gray-700">
              Redirigiendo en {countdown} segundos...
            </span>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex space-x-4 w-full">
          <button 
            onClick={() => router.replace("/")}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            Ir a Home
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition-all duration-300"
          >
            Verificar Nuevamente
          </button>
        </div>
      </div>
      
      {/* Floating elements for modern design */}
      <div className="fixed top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="fixed bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="fixed top-1/2 left-10 w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg w-full flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          </div>
          <h1 className="text-3xl font-bold text-blue-600 mb-3">Verificando Pago...</h1>
          <p className="text-xl text-gray-600 mb-2">Estamos procesando tu información</p>
          <p className="text-gray-500">Por favor espera mientras verificamos tu transacción.</p>
        </div>
        
        {/* Floating elements for modern design */}
        <div className="fixed top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="fixed bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="fixed top-1/2 left-10 w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}