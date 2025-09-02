"use client";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasInitialized = useRef(false);
  const [countdown, setCountdown] = useState(5);
  const [transactionStatus, setTransactionStatus] = useState<string>("checking");
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const checkTransactionAndUpdateOrder = async () => {
      const userId = searchParams ? searchParams.get("userId") : null;
      const orderId = searchParams ? searchParams.get("orderId") : null;
      
      if (userId && orderId) {
        try {
          const transactionResponse = await fetch(`/api/transactions/check-status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ orderId }),
          });
          
          if (transactionResponse.ok) {
            const transactionData = await transactionResponse.json();
            
            if (transactionData.success) {
              setTransactionStatus("approved");
              
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
            }
          } else {
            setTransactionStatus("error");
          }
        } catch (error) {
          console.error("Error checking transaction status:", error);
          setTransactionStatus("error");
        }
      } else {
        setTransactionStatus("error");
      }
    };

    // Limpiar carrito completamente
    const clearCartCompletely = async () => {
      try {
        const userId = searchParams ? searchParams.get("userId") : null;
        
        // Limpiar localStorage
        localStorage.removeItem("cart");
        
        // Limpiar carrito en la base de datos si hay userId
        if (userId) {
          await fetch("/api/cart", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          });
          console.log("✅ Carrito limpiado completamente de la base de datos");
        }
        
        console.log("✅ Carrito limpiado completamente");
      } catch (error) {
        console.error("Error limpiando carrito:", error);
      }
    };

    clearCartCompletely();
    checkTransactionAndUpdateOrder();
    
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
  }, []);

  const getStatusIcon = () => {
    switch (transactionStatus) {
      case "approved":
        return (
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case "pending":
        return (
          <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
        );
    }
  };

  const getStatusMessage = () => {
    switch (transactionStatus) {
      case "approved":
        return {
          title: "Payment Successful",
          subtitle: "Transaction confirmed",
          description: "Your order has been processed and you will receive a confirmation email shortly.",
          statusClass: "text-emerald-600",
          bgClass: "bg-emerald-50 border-emerald-200",
          countdownClass: "text-emerald-700"
        };
      case "pending":
        return {
          title: "Processing Payment",
          subtitle: "Verifying transaction",
          description: "We are confirming your payment. This may take a few moments.",
          statusClass: "text-amber-600",
          bgClass: "bg-amber-50 border-amber-200",
          countdownClass: "text-amber-700"
        };
      case "error":
        return {
          title: "Verification Failed",
          subtitle: "Unable to confirm payment",
          description: "Please contact our support team if you have any questions.",
          statusClass: "text-red-600",
          bgClass: "bg-red-50 border-red-200",
          countdownClass: "text-red-700"
        };
      default:
        return {
          title: "Verifying Payment",
          subtitle: "Processing your information",
          description: "Please wait while we verify your transaction details.",
          statusClass: "text-blue-600",
          bgClass: "bg-blue-50 border-blue-200",
          countdownClass: "text-blue-700"
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          {getStatusIcon()}
          
          <h1 className={`text-3xl font-bold mb-2 ${statusInfo.statusClass}`}>
            {statusInfo.title}
          </h1>
          
          <p className="text-lg text-gray-600 mb-4 font-medium">
            {statusInfo.subtitle}
          </p>
          
          <p className="text-gray-500 mb-8 leading-relaxed">
            {statusInfo.description}
          </p>

          {orderDetails && transactionStatus === "approved" && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-mono text-sm text-gray-800">{orderDetails.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold text-emerald-600">${orderDetails.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className={`${statusInfo.bgClass} border rounded-xl p-4 mb-6`}>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
              <span className={`text-sm font-medium ${statusInfo.countdownClass}`}>
                Redirecting in {countdown} seconds
              </span>
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => router.replace("/")}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200"
            >
              Go to Home
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-300 transition-colors duration-200"
            >
              Verify Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-gray-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-blue-600">Loading...</h1>
            <p className="text-lg text-gray-600 mb-4 font-medium">Processing your information</p>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}