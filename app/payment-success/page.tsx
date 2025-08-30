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
  const [orderDetails, setOrderDetails] = useState<any>(null);

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
              
              // Get order details for display
              try {
                const orderResponse = await fetch(`/api/orders/details?orderId=${orderId}`);
                if (orderResponse.ok) {
                  const orderData = await orderResponse.json();
                  setOrderDetails(orderData.order);
                }
              } catch (error) {
                console.error("Error fetching order details:", error);
              }
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
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-2xl">
              <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2l4-4" />
              </svg>
            </div>
            {/* Success rings animation */}
            <div className="absolute inset-0 w-32 h-32 border-4 border-green-300 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-0 w-32 h-32 border-4 border-green-400 rounded-full animate-ping opacity-50" style={{animationDelay: '0.5s'}}></div>
          </div>
        );
      case "pending":
        return (
          <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-8 shadow-2xl">
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-pink-600 rounded-full flex items-center justify-center mb-8 shadow-2xl">
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-2xl">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white"></div>
          </div>
        );
    }
  };

  const getStatusMessage = () => {
    switch (transactionStatus) {
      case "approved":
        return {
          title: "Payment Successful! 🎉",
          subtitle: "Your transaction has been confirmed",
          description: "Your order has been marked as completed and you will receive a receipt by email.",
          statusClass: "text-green-600",
          bgClass: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
          countdownClass: "text-green-700"
        };
      case "pending":
        return {
          title: "Payment Processing ⏳",
          subtitle: "Your payment is being processed",
          description: "We are verifying your transaction. This may take a few minutes.",
          statusClass: "text-yellow-600",
          bgClass: "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200",
          countdownClass: "text-yellow-700"
        };
      case "error":
        return {
          title: "Verification Error ❌",
          subtitle: "We couldn't verify your transaction",
          description: "Please contact support if you have any questions.",
          statusClass: "text-red-600",
          bgClass: "bg-gradient-to-r from-red-50 to-pink-50 border-red-200",
          countdownClass: "text-red-700"
        };
      default:
        return {
          title: "Verifying Payment... 🔍",
          subtitle: "We are processing your information",
          description: "Please wait while we verify your transaction.",
          statusClass: "text-blue-600",
          bgClass: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200",
          countdownClass: "text-blue-700"
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200 to-blue-300 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-2xl w-full flex flex-col items-center text-center relative z-10 border border-white/20">
        {getStatusIcon()}
        
        <h1 className={`text-5xl font-bold mb-4 ${statusInfo.statusClass} tracking-tight`}>
          {statusInfo.title}
        </h1>
        
        <p className="text-2xl text-gray-600 mb-3 font-medium">
          {statusInfo.subtitle}
        </p>
        
        <p className="text-gray-500 mb-8 leading-relaxed text-lg max-w-md">
          {statusInfo.description}
        </p>

        {/* Order Details Card */}
        {orderDetails && transactionStatus === "approved" && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8 w-full max-w-md">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Order Details</h3>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-semibold text-blue-900">{orderDetails.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-green-600">${orderDetails.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">✅ Completed</span>
              </div>
            </div>
          </div>
        )}
        
        <div className={`${statusInfo.bgClass} border rounded-2xl p-6 mb-8 w-full max-w-md`}>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span className={`text-xl font-semibold ${statusInfo.countdownClass}`}>
              Redirecting in {countdown} seconds...
            </span>
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          </div>
        </div>
        
        <div className="flex space-x-4 w-full max-w-md">
          <button 
            onClick={() => router.replace("/")}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            🏠 Go to Home
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-bold py-4 px-6 rounded-2xl transition-all duration-300 border border-gray-300 hover:shadow-lg"
          >
            🔄 Verify Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-300 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-200 to-blue-300 rounded-full opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-300 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-2xl w-full flex flex-col items-center text-center relative z-10 border border-white/20">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-2xl">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white"></div>
          </div>
          <h1 className="text-5xl font-bold text-blue-600 mb-4 tracking-tight">Verifying Payment... 🔍</h1>
          <p className="text-2xl text-gray-600 mb-3 font-medium">We are processing your information</p>
          <p className="text-gray-500 text-lg max-w-md">Please wait while we verify your transaction.</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}